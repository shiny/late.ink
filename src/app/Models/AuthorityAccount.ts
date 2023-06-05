import { DateTime } from 'luxon'
import { BelongsTo, belongsTo, column, scope } from '@ioc:Adonis/Lucid/Orm'
import Authority from './Authority'
import type { Ca } from 'handyacme'
import BaseModel from './BaseModel'
import CertificateAuthorization from './CertificateAuthorization'
import CertificateOrder from './CertificateOrder'
import CertificateChallenge from './CertificateChallenge'
import AcmeObject from './AcmeObject'

export default class AuthorityAccount extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public authorityId: number

    @belongsTo(() => Authority)
    public authority: BelongsTo<typeof Authority>

    @column()
    public email: string

    @column()
    public workspaceId: number

    @column({
        serializeAs: null
    })
    public accountUrl: string

    @column({
        consume: (value: string) => JSON.parse(value),
        serializeAs: null
    })
    public jwk: string

    public static inWorkspace = scope((query, workspaceId: number) => {
        query.where('workspace_id', workspaceId)
    })

    @column.dateTime({ autoCreate: true, serializeAs: null })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime


    private acmeInstance: Ca

    public async resolveInstance(): Promise<Ca> {

        if (!this.acmeInstance) {

            /**
             * this.related('relation') throws error 
             * https://github.com/adonisjs/lucid/issues/866
             */
            await (this as AuthorityAccount).load('authority')

            this.acmeInstance = await this.authority.resolveInstance()
            await this.acmeInstance.importAccount({
                email: this.email,
                accountUrl: this.accountUrl,
                jwk: this.jwk
            })
        }
        return this.acmeInstance
    }

    public async createOrder(domains: string[]) {
        const ca = await this.resolveInstance()
        try {
            return await ca.createOrder(domains)
        } catch (err) {
            console.log('errors', err)
            throw err
        }
    }

    public async syncFromRemote(model: CertificateOrder): Promise<CertificateOrder>;
    public async syncFromRemote(model: CertificateAuthorization): Promise<CertificateAuthorization>;
    public async syncFromRemote(model: CertificateChallenge): Promise<CertificateChallenge>;
    public async syncFromRemote(model: AcmeObject): Promise<AcmeObject> {

        const ca = await this.resolveInstance()
        const instances = [CertificateOrder, CertificateAuthorization, CertificateChallenge]
        const methods = ['restoreOrder', 'restoreAuthorization', 'restoreChallenge']
        const index = instances.findIndex(instance => model instanceof instance)
        if (index < 0) {
            throw new Error(`Unexpected model object on syncing`)
        }
        const { status } = await ca[methods[index]](model.url)
        if (status !== model.status) {
            model.status = status
            await model.save()
        }
        return model
    }

    public async test() {
        const ca = await this.resolveInstance()
        const content = await ca.postAsGet(ca.account.accountUrl)
        const result = await content.json()
        return result as LetsEncryptAccountEntry | ZeroSSLAccountEntry
    }
}

interface LetsEncryptAccountEntry {
    key: {
        kty: string
        crv: string
        x: string
        y: string
    }
    contact: string[]
    initialIp: string
    createdAt: string
    status: string
}

interface ZeroSSLAccountEntry {
    contact: string[]
    termsOfServiceAgreed: boolean
    status: string
    orders: string // url
    externalAccountBinding: {
        payload: string
        protected: string
        signature: string
    }
}
