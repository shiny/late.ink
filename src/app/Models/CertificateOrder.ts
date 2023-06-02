import { DateTime } from 'luxon'
import { BelongsTo, HasMany, belongsTo, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
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

export default class CertificateOrder extends BaseModel {
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

        const {
            status,
            url,
            finalizeUrl,
            certificateUrl,
            expiredAt,
            authorizations
        } = await account.createOrder(domains)

        order.status = status
        order.orderUrl = url
        order.finalizeUrl = finalizeUrl
        order.certificateUrl = certificateUrl
        order.expiredAt = DateTime.fromJSDate(expiredAt)
        const authItems = await authorizations()

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

    /**
     * Get the current order processing state
     * 
     * State Transitions for Order Objects
     * ```markdown
     *     pending --------------+
     *        |                  |
     *        | All authz        |
     *        | "valid"          |
     *        V                  |
     *      ready ---------------+
     *        |                  |
     *        | Receive          |
     *        | finalize         |
     *        | request          |
     *        V                  |
     *    processing ------------+
     *        |                  |
     *        | Certificate      | Error or
     *        | issued           | Authorization failure
     *        V                  V
     *      valid             invalid
     * ```
     */
    public async getCurrentState(): Promise<OrderStateType> {
        switch (this.status) {
            case 'ready':
            case 'valid':
            case 'pending':
                const state = await CertificateAction.whatAbout('Order', this.status, this.id)
                return `${this.status}:${state}`
            case 'invalid':
            case 'processing':
                return this.status
        }
    }

    /**
     * Processing the order and return it's state (before processing)
     */
    public async process(): Promise<OrderStateType> {
        const mutex = await Mutex.acquire(`order:${this.id}`)
        if (!mutex) {
            return 'ignore'
        }

        if (!this.authorizations) {
            await (this as CertificateOrder).load('authorizations')
        }

        try {
            const state = await this.getCurrentState()
            switch (state) {
                case 'pending:ready':
                    // go authoring (e.g. Set a DNS text record)
                    await this.startProcess()
                    break
                case 'pending:completed':
                    // Verify the local authorzation and fetch state from remote
                    // e.g. check the DNS record, fetch auth state when DNS has been set
                    await this.completeProcess()
                    break
                case 'ready:ready':
                    // Finalize the order
                    await Event.emit('order:ready:ready', this)
                    break
                case 'ready:completed':
                    // Fetch the order state from acme server
                    await Event.emit('order:ready:completed', this)
                    break
                case 'valid:ready':
                    // Download the cert
                    await Event.emit('order:valid:ready', this)
                    break
                case 'valid:completed':
                    // Do the cleanning, Create a renewal job
                    await Event.emit('order:valid:completed', this)
                    break
                // others: do nothing and return the state
                default:
                    return state
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
        const state = await this.getCurrentState()
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
        const state = await this.getCurrentState()
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
