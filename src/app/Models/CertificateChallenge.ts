import { DateTime } from 'luxon'
import { BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import CertificateAuthorization from './CertificateAuthorization'
import CertificateOrder from './CertificateOrder'
import { Challenge } from 'handyacme'
import { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'
import BaseModel from "./BaseModel"
import CertificateAction from 'App/Utils/CertificateAction'
import Verification from 'App/Dns/Verification'
import Logger from '@ioc:Adonis/Core/Logger'

export enum ChallengeType {
    'http-01',
    'dns-01',
    'tls-alpn-01'
}
export type ChallengeTypeType = keyof typeof ChallengeType

export enum ChallengeStatus {
    pending,
    processing,
    invalid,
    valid,
    revoked,
    deactivated,
    expired
}
export type ChallengeStatusType = keyof typeof ChallengeStatus

interface CreateFromResponseOptions {
    orderId: number
    authorizationId: number
    challenge: Challenge
    trx?: TransactionClientContract
}


export default class CertificateChallenge extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public type: ChallengeTypeType

    @column()
    public status: ChallengeStatusType

    @column()
    public url: string

    @column({
        serializeAs: null
    })
    @column()
    public token: string

    @column({
        serializeAs: null
    })
    public signkey: string

    @column()
    public certificateAuthorizationId: number

    @belongsTo(() => CertificateAuthorization)
    public authorization: BelongsTo<typeof CertificateAuthorization>

    @column()
    public certificateOrderId: number

    @belongsTo(() => CertificateOrder)
    public order: BelongsTo<typeof CertificateOrder>

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime


    public static async createFromResponse({ orderId, authorizationId, challenge, trx }: CreateFromResponseOptions) {
        const certChallenge = new CertificateChallenge
        certChallenge.type = challenge.type
        certChallenge.status = challenge.status
        certChallenge.url = challenge.url
        certChallenge.token = challenge.token
        certChallenge.signkey = await challenge.sign()
        certChallenge.certificateAuthorizationId = authorizationId
        certChallenge.certificateOrderId = orderId

        if (trx) {
            certChallenge.useTransaction(trx)
        }
        await certChallenge.save()
    }

    /**
     * State Transitions for Challenge Objects
     * ```markdown
     *            pending
     *               |
     *               | Receive
     *               | response
     *               V
     *           processing <-+
     *               |   |    | Server retry or
     *               |   |    | client retry request
     *               |   +----+
     *               |
     *               |
     *   Successful  |   Failed
     *   validation  |   validation
     *     +---------+---------+
     *     |                   |
     *     V                   V
     *   valid              invalid
     * ```
     **/
    public async getCurrentState() {
        if (this.status === 'pending') {
            const state = await CertificateAction.whatAbout('Challenge', this.status, this.id)
            return `${this.status}:${state}`
        } else {
            return this.status
        }
    }

    public async startProcess() {
        const state = await this.getCurrentState()
        if (state.startsWith('valid')) {
            return true
        }
        if (state !== 'pending:ready') {
            return false
        }
        try {
            if (await CertificateAction.start('Challenge', this.status, this.id)) {
                await this.setDns()
                await CertificateAction.done('Challenge', this.status, this.id)
                return true
            } else {
                return false
            }
        } catch (error) {
            
            if (error.code !== 'ECONNRESET') {
                await CertificateAction.error('Challenge', this.status, this.id, error.message)
            }
            throw error
        }
    }

    public async completeProcess(shouldVerify = true) {
        const state = await this.getCurrentState()
        if (state !== 'pending:completed' && state !== 'processing') {
            return false
        }
        // verify dns
        if (shouldVerify) {
            const verified = await this.isDnsVerified()
            if (!verified) {
                return false
            }
        }
        if (!this.order) {
            await (this as CertificateChallenge).load('order')
        }
        if (!this.order.authorityAccount) {
            await this.order.load('authorityAccount')
        }
        await this.order.authorityAccount.syncFromRemote(this)
    }

    public async isDnsVerified() {
        const hostname = await this.hostname()
        return Verification.haveTxtRecord(hostname, this.signkey)
    }

    public async hostname() {
        if (!this.authorization) {
            await (this as CertificateChallenge).load('authorization')
        }
        const prefix = '_acme-challenge'
        const hostname = this.authorization.identifierValue
        return `${prefix}.${hostname}`
    }

    public async dns() {
        await (this as CertificateChallenge).load('order')
    }

    public async setDns() {
        await (this as CertificateChallenge).load('order')
        await this.order.load('dnsProviderCredential')
        const dns = await this.order.dnsProviderCredential.dns()
        const hostname = await this.hostname()
        const dnsSet = await dns.setTxtRecord(hostname, this.signkey)
        Logger.info(`Setting dns txt record ${hostname} to ${this.signkey}`)
        return dnsSet
    }

    public async removeDns() {
        await (this as CertificateChallenge).load('order')
        await this.order.load('dnsProviderCredential')
        const dns = await this.order.dnsProviderCredential.dns()
        const hostname = await this.hostname()
        const deleted = await dns.deleteTxtRecord(hostname, this.signkey)
        Logger.info(`Delete dns txt record ${hostname}: ${this.signkey}`)
        return deleted
    }
}
