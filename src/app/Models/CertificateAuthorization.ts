import { DateTime } from 'luxon'
import { BelongsTo, HasMany, belongsTo, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import CertificateOrder from './CertificateOrder'
import CertificateChallenge from './CertificateChallenge'
import { Authorization } from 'handyacme'
import { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'
import AcmeObject from "./AcmeObject"

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

export default class CertificateAuthorization extends AcmeObject {
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

    public readonly acmeObjectType = 'Authorization'
    public readonly statesShouldProcess = ['pending']

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
