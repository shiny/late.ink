import { DateTime } from 'luxon'
import { BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import CertificateAuthorization from './CertificateAuthorization'
import CertificateOrder from './CertificateOrder'
import { Challenge } from 'handyacme'
import { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'
import AcmeObject from "./AcmeObject"
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


export default class CertificateChallenge extends AcmeObject {
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

    public readonly acmeObjectType = 'Challenge'
    public readonly statesShouldProcess = ['pending']

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

    public async isVerified() {
        return this.isDnsVerified()
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
