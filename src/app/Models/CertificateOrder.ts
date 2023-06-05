import { DateTime } from 'luxon'
import { BelongsTo, HasMany, belongsTo, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Authority from './Authority'
import Workspace from './Workspace'
import AuthorityAccount from './AuthorityAccount'
import DnsProviderCredential from './DnsProviderCredential'
import CertificateAuthorization from './CertificateAuthorization'
import Certificate from './Certificate'
import Database from '@ioc:Adonis/Lucid/Database'
import AcmeObject from './AcmeObject'
import Mutex from 'App/Utils/Mutex'

export enum OrderStatus {
    pending,
    ready,
    processing,
    valid,
    invalid,
}

export type OrderStateType = "ignore" | "invalid" | "processing" | 
    "ready:ready" | "ready:processing" | "ready:completed" | "ready:error" |
    "valid:ready" | "valid:processing" | "valid:completed" | "valid:error" |
    "pending:ready" | "pending:processing" | "pending:completed" | "pending:error"

export type OrderStatusType = keyof typeof OrderStatus

export interface CertificateOrderCreateOptions {
    domains: string[]
    authorityAccountId: number
    workspaceId: number
    dnsProviderCredentialId: number
    certificateId?: number
}

export default class CertificateOrder extends AcmeObject {
    @column({ isPrimary: true })
    public id: number

    @column({
        prepare: (value: string[]) => value.join(','),
        consume: (value: string) => value.split(',')
    })
    public domains: string[]

    @column({
        serializeAs: null
    })
    public url: string

    @column({
        serializeAs: null
    })
    public certificateUrl: string

    @column()
    public status: OrderStatusType

    @column({
        serializeAs: null
    })
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

    @belongsTo(() => Certificate)
    public certificate: BelongsTo<typeof Certificate>

    @column()
    public certificateId: number

    @column.dateTime()
    public expiredAt: DateTime

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime

    public readonly acmeObjectType = 'Order'
    public readonly statesShouldProcess = ['ready','valid', 'pending']

    public static async createFromRemote(options: CertificateOrderCreateOptions) {
        const {
            domains,
            authorityAccountId,
            workspaceId,
            dnsProviderCredentialId,
            certificateId
        } = options
        const order = new CertificateOrder
        const account = await AuthorityAccount.findOrFail(authorityAccountId)
        order.authorityId = account.authorityId
        order.authorityAccountId = authorityAccountId
        order.workspaceId = workspaceId
        order.dnsProviderCredentialId = dnsProviderCredentialId
        order.domains = domains

        // when cert is renewing, certificateId is not empty
        if (certificateId) {
            order.certificateId = certificateId
        }

        await account.createOrder(domains)

        const res = await account.createOrder(domains)
        const {
            status,
            url,
            finalizeUrl,
            certificateUrl,
            expiredAt,
        } = res
        order.status = status
        order.url = url
        order.finalizeUrl = finalizeUrl
        order.certificateUrl = certificateUrl
        order.expiredAt = DateTime.fromJSDate(expiredAt)
        const authItems = await res.authorizations()

        await Database.transaction(async trx => {
            order.useTransaction(trx)
            await order.save()
            await Promise.all(authItems.map(item => CertificateAuthorization.createFromResponse({
                orderId: order.id,
                trx,
                authorization: item,
            })))
        })
        await order.load('authorizations')
        await Promise.all(order.authorizations.map(item => item.load('challenges')))
        return order
    }

    public async syncFromRemote(fields: string[] = ['certificateUrl']) {
        return super.syncFromRemote(fields)
    }

    public toJSON() {
        return this.serialize({
            fields: {
                omit: ['createdAt', 'updatedAt', 'workspaceId', 'url', 'finalizeUrl']
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

    /**
     * Processing the order and return it's state (before processing)
     */
    public async bump(): Promise<string> {
        const mutex = await Mutex.acquire(`order:${this.id}`)
        if (!mutex) {
            return 'ignore'
        }

        try {
            await this.syncFromRemote()
            await this.emitState()
            return this.getCurrentState()
        } catch (error) {
            throw error
        } finally {
            if (mutex)
                await mutex.release()
        }
    }
}
