import { DateTime } from 'luxon'
import { BelongsTo, HasMany, belongsTo, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import CertificateOrder from './CertificateOrder'
import CertificateChallenge from './CertificateChallenge'
import { Authorization } from 'handyacme'
import { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'
import BaseModel from "./BaseModel"
import CertificateAction from 'App/Utils/CertificateAction'

/**
 * {
     "status": "valid",
     "expires": "2015-03-01T14:09:07.99Z",

     "identifier": {
       "type": "dns",
       "value": "www.example.org"
     },

     "challenges": [
       {
         "url": "https://example.com/acme/chall/prV_B7yEyA4",
         "type": "http-01",
         "status": "valid",
         "token": "DGyRejmCefe7v4NfDGDKfA",
         "validated": "2014-12-01T12:05:58.16Z"
       }
     ],

     "wildcard": false
   }
 */

export enum AuthorizationStatus {
    pending,
    valid,
    invalid,
    deactivated,
    expired,
    revoked
}

export type AuthorizationStatusType = keyof typeof AuthorizationStatus

interface CreateFromResponseOptions {
    orderId: number
    authorization: Authorization
    trx?: TransactionClientContract
}

export default class CertificateAuthorization extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public isWildcard: boolean

    @column()
    public status: AuthorizationStatusType

    @column()
    public identifierType: string

    @column()
    public identifierValue: string

    /**
     *  The timestamp after which the server
     *  will consider this authorization invalid
     * 
     *  REQUIRED for "valid"
     *  in the "status" field.
     * 
     *  or we should ignore it
     */
    @column.dateTime()
    public expiredAt: DateTime

    @column()
    public url: string

    @column()
    public certificateOrderId: number

    @belongsTo(() => CertificateOrder)
    public order: BelongsTo<typeof CertificateOrder>

    @hasMany(() => CertificateChallenge)
    public challenges: HasMany<typeof CertificateChallenge>

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime

    public static async createFromResponse({ orderId, authorization, trx }: CreateFromResponseOptions) {
        const certAuthorization = new CertificateAuthorization
        certAuthorization.status = authorization.status
        certAuthorization.url = authorization.url
        certAuthorization.isWildcard = authorization.isWildcard
        certAuthorization.identifierType = authorization.identifierType
        certAuthorization.identifierValue = authorization.identifierValue
        certAuthorization.expiredAt = DateTime.fromJSDate(authorization.expiresAt)
        certAuthorization.certificateOrderId = orderId

        if (trx) {
            certAuthorization.useTransaction(trx)
        }
        await certAuthorization.save()
        await Promise.all(
            authorization.challenges
                .filter(item => (item.isVerifyByDns01 || item.isVerifyByHttp01))
                .map(item => CertificateChallenge.createFromResponse({
                    trx,
                    orderId,
                    authorizationId: certAuthorization.id,
                    challenge: item
                }))
        )
        return certAuthorization
    }

    
    /**
     * 
     * State Transitions for Authorization Objects
     * ```markdown
     *                   pending --------------------+
     *                      |                        |
     *    Challenge failure |                        |
     *           or         |                        |
     *          Error       |  Challenge valid       |
     *            +---------+---------+              |
     *            |                   |              |
     *            V                   V              |
     *         invalid              valid            |
     *                                |              |
     *                                |              |
     *                                |              |
     *                 +--------------+--------------+
     *                 |              |              |
     *                 |              |              |
     *          Server |       Client |   Time after |
     *          revoke |   deactivate |    "expires" |
     *                 V              V              V
     *              revoked      deactivated      expired
     * ```
     */
    public async getCurrentState() {
        switch (this.status) {
            case 'pending':
                const state = await CertificateAction.whatAbout('Authorization', this.status, this.id)
                return `${this.status}:${state}`

            case 'invalid':
            case 'valid':
            case 'deactivated':
            case 'expired':
            case 'revoked':
                return this.status
        }
    }

    /**
     * set the challenge dns
     */
    public async startProcess() {
        const state = await this.getCurrentState()
        const challenge = await this.dnsChallenge()
        // it's already authorized!
        if (state.startsWith('valid')) {
            return true
        }
        if (state !== 'pending:ready') {
            return false
        }
        try {
            if (await CertificateAction.start('Authorization', this.status, this.id)) {
                const result = await challenge.startProcess()
                if (!result) {
                    throw new Error('Challenge dns set failed, may be state problem')
                }
                await CertificateAction.done('Authorization', this.status, this.id)
                return true
            } else {
                return false
            }
        } catch (error) {
            if (error.code !== 'ECONNRESET') {
                await CertificateAction.error('Authorization', this.status, this.id, error.message)
            }
            throw error
        }
    }

    public async completeProcess() {
        const state = await this.getCurrentState()
        const challenge = await this.dnsChallenge()
        const shouldVerifiy = state === 'pending:completed'
        if (state !== 'pending:completed') {
            return false
        }
        await challenge.completeProcess(shouldVerifiy)
        if (challenge.status !== 'valid') {
            return false
        }

        if (!this.order) {
            await (this as CertificateAuthorization).load('order')
        }
        if (!this.order.authorityAccount) {
            await this.order.load('authorityAccount')
        }
        await this.order.authorityAccount.syncFromRemote(this)
    }

    public async dnsChallenge() {
        if (!this.challenges) {
            await (this as CertificateAuthorization).load('challenges')
        }
        const dnsChallenge = this.challenges.find(challenge => challenge.type === 'dns-01')
        if (!dnsChallenge) {
            throw new Error('No dns challenge in Authorization #' + this.id)
        }
        return dnsChallenge
    }
}
