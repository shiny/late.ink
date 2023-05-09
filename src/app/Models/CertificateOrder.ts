import { DateTime } from 'luxon'
import { BelongsTo, HasMany, HasOne, belongsTo, column, hasMany, hasOne } from '@ioc:Adonis/Lucid/Orm'
import Authority from './Authority'
import Workspace from './Workspace'
import AuthorityAccount from './AuthorityAccount'
import DnsProviderCredential from './DnsProviderCredential'
import CertificateAuthorization from './CertificateAuthorization'
import Certificate from './Certificate'
import Database from '@ioc:Adonis/Lucid/Database'
import BaseModel from './BaseModel'
import CertificateAction from 'App/Utils/CertificateAction'
import Event from '@ioc:Adonis/Core/Event'
import Mutex from 'App/Utils/Mutex'

export enum OrderStatus {
    pending,
    ready,
    processing,
    valid,
    invalid,
}
export type OrderStatusType = keyof typeof OrderStatus

export interface CertificateOrderCreateOptions {
    domains: string[]
    authorityAccountId: number
    workspaceId: number
    dnsProviderCredentialId: number
}

export default class CertificateOrder extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column({
        prepare: (value: string[]) => value.join(','),
        consume: (value: string) => value.split(',')
    })
    public domains: string[]

    @column()
    public orderUrl: string

    /**
     * alias for orderUrl
     */
    public get url() {
        return this.orderUrl
    }

    public set url(value) {
        this.orderUrl = value
    }

    @column()
    public certificateUrl: string

    @column()
    public status: OrderStatusType

    @column()
    public finalizeUrl: string

    @column()
    public authorityId: number

    @belongsTo(() => Authority)
    public authority: BelongsTo<typeof Authority>

    @column()
    public workspaceId: number

    @belongsTo(() => Workspace)
    public workspace: BelongsTo<typeof Workspace>

    @column()
    public authorityAccountId: number

    @belongsTo(() => AuthorityAccount)
    public authorityAccount: BelongsTo<typeof AuthorityAccount>

    @hasMany(() => CertificateAuthorization)
    public authorizations: HasMany<typeof CertificateAuthorization>

    @column()
    public dnsProviderCredentialId: number

    @belongsTo(() => DnsProviderCredential)
    public dnsProviderCredential: BelongsTo<typeof DnsProviderCredential>

    @hasOne(() => Certificate, {
        foreignKey: 'orderId'
    })
    public certificate: HasOne<typeof Certificate>

    @column.dateTime()
    public expiredAt: DateTime

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime

    public static async createFromRemote({ domains, authorityAccountId, workspaceId, dnsProviderCredentialId }: CertificateOrderCreateOptions) {
        const order = new CertificateOrder
        const account = await AuthorityAccount.findOrFail(authorityAccountId)
        order.authorityId = account.authorityId
        order.authorityAccountId = authorityAccountId
        order.workspaceId = workspaceId
        order.dnsProviderCredentialId = dnsProviderCredentialId
        order.domains = domains

        const remoteOrder = await account.createOrder(domains)
        order.status = remoteOrder.status
        order.orderUrl = remoteOrder.url
        order.finalizeUrl = remoteOrder.finalizeUrl
        order.certificateUrl = remoteOrder.certificateUrl
        order.expiredAt = DateTime.fromJSDate(remoteOrder.expiredAt)


        await Database.transaction(async trx => {
            order.useTransaction(trx)
            await order.save()
            const responses = await remoteOrder.authorizations()
            await Promise.all(responses.map(item => CertificateAuthorization.createFromResponse({
                orderId: order.id,
                trx,
                authorization: item,
            })))
        })
        await order.load('authorizations')
        await Promise.all(order.authorizations.map(item => item.load('challenges')))
        return order
    }

    public toJSON() {
        return this.serialize({
            fields: {
                omit: ['createdAt', 'updatedAt', 'workspaceId', 'orderUrl', 'finalizeUrl']
            },
            relations: {
                authorizations: {
                    fields: {
                        omit: ['certificateOrderId', 'url', 'createdAt', 'updatedAt']
                    },
                    relations: {
                        challenges: {
                            fields: {
                                omit: ['url', 'token', 'certificateAuthorizationId', 'certificateOrderId', 'createdAt', 'updatedAt']
                            }
                        }
                    }
                },
                authorityAccount: {
                    fields: {
                        omit: ['accountUrl', 'createdAt', 'updatedAt']
                    }
                },
                authority: {
                    fields: {
                        omit: ['directoryUrl', 'newNonce', 'newAccount', 'newOrder', 'revokeCert', 'keyChange', 'createdAt', 'updatedAt']
                    }
                },
                certificate: {
                    fields: {
                        omit: ['createdAt', 'updatedAt', 'validToFromCrt']
                    }
                }
            }
        })
    }

    public async action() {
        switch (this.status) {
            case 'ready':
            case 'valid':
            case 'pending':
                // ready:ready
                // ready:finalizing
                // ready:finalized
                // ready:error

                // valid:ready
                // valid:downloading
                // valid:downloaded
                // valid:error

                // 'pending:ready'
                // 'pending:authorizing'
                // 'pending:authorized'
                // 'pending:error'
                const state = await CertificateAction.whatAbout('Order', this.status, this.id)

                return `${this.status}:${state}`
            case 'invalid':
            case 'processing':
                return this.status
        }
    }

    public async process() {

        const mutex = await Mutex.acquire(`order:${this.id}`)
        try {
            if (!mutex) {
                return 'ignore'
            }
            const state = await this.action()

            if (!this.authorizations) {
                await (this as CertificateOrder).load('authorizations')
            }
    
            switch (state) {
                case 'pending:ready':
                    await this.startProcess()
                    break
                case 'pending:completed':
                    await this.completeProcess()
                    break
                case 'ready:ready':
                    // should finalize the order
                    await Event.emit('order:ready:ready', this)
                    break
                case 'ready:completed':
                    await Event.emit('order:ready:completed', this)
                    break
                case 'valid:ready':
                    // should download the cert
                    await Event.emit('order:valid:ready', this)
                    break
                case 'valid:completed':
                    // should download the cert
                    await Event.emit('order:valid:completed', this)
                    break
            }
            return state
        } catch (error) {
            throw error
        } finally {
            if (mutex)
                await mutex.release()
        }
    }

    /**
     * start authorizing
     * @returns true on complete, false on state failure
     */
    public async startProcess() {
        const state = await this.action()
        // it's already authorized!
        if (state.startsWith('valid') || state.startsWith('ready')) {
            return true
        }
        if (state !== 'pending:ready') {
            return false
        }

        if (!this.authorizations) {
            await (this as CertificateOrder).load('authorizations')
        }
        try {
            if(await CertificateAction.start('Order', this.status, this.id)) {
                const results: boolean[] = []
                for(const auth of this.authorizations) {
                    // Some DNS service providers don't support concurrently calling the API.
                    results.push(await auth.startProcess())
                }
                const hasFailedAuthorization = results.some(result => !result)
                if (hasFailedAuthorization) {
                    throw new Error('Some authorization failed, may be caused by state')
                }
                await CertificateAction.done('Order', this.status, this.id)
                return true
            } else {
                return false
            }
        } catch (error) {
            if (error.code !== 'ECONNRESET') {
                await CertificateAction.error('Order', this.status, this.id, error.message)
            }
            throw error
        }
    }

    /**
     * Verify and notify the authorization is complete
     */
    public async completeProcess() {
        const state = await this.action()
        if (state !== 'pending:completed') {
            return false
        }
        if (!this.authorizations) {
            await (this as CertificateOrder).load('authorizations')
        }
        await Promise.all(this.authorizations.map(item => item.completeProcess()))
        // not all authorizations valid 
        const shouldSkip = this.authorizations.some(item => item.status !== 'valid')
        if (shouldSkip) {
            return false
        }
        if (!this.authorityAccount) {
            await (this as CertificateOrder).load('authorityAccount')
        }
        await this.authorityAccount.syncFromRemote(this)
    }
}
