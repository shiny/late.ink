import { DateTime } from 'luxon'
import { column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import ACME, { Ca } from 'handyacme'
import AuthorityAccount from './AuthorityAccount'
import { autoProxyDirectory } from 'App/Utils/Proxy'
import BaseModel from './BaseModel'

export type AvailableAuthority = 'LetsEncrypt' | 'ZeroSSL' | 'BuyPass'
export type AvailableEnvironment = 'staging' | 'production'

export default class Authority extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public ca: AvailableAuthority

    @column()
    public type: AvailableEnvironment

    @column()
    public directoryUrl: string

    @column({
        serializeAs: null
    })
    public newNonce: string

    @column({
        serializeAs: null
    })
    public newAccount: string

    @column({
        serializeAs: null
    })
    public newOrder: string

    @column({
        serializeAs: null
    })
    public revokeCert: string

    @column({
        serializeAs: null
    })
    public keyChange: string

    @column()
    public externalAccountRequired: boolean

    @column.dateTime({ autoCreate: true, serializeAs: null })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
    public updatedAt: DateTime

    @hasMany(() => AuthorityAccount)
    public accounts: HasMany<typeof AuthorityAccount>

    private acmeInstance: Ca

    public async resolveInstance(): Promise<Ca> {
        if (!this.acmeInstance) {
            this.acmeInstance = await ACME.create(this.ca, "none")
            await autoProxyDirectory(this.acmeInstance, this.type)
        }
        return this.acmeInstance
    }

    public static async discoverAndSave(
        authorityName: AvailableAuthority,
        type: AvailableEnvironment
    ) {
        const ca = await ACME.create(authorityName, "none")
        await autoProxyDirectory(ca, type)
        return Authority.updateOrCreate(
            {
                ca: authorityName,
                type,
            },
            {
                ca: authorityName,
                type,
                directoryUrl: ca.directory.directoryUrl,
                newNonce: ca.directory.newNonce,
                newAccount: ca.directory.newAccount,
                newOrder: ca.directory.newOrder,
                revokeCert: ca.directory.revokeCert,
                keyChange: ca.directory.keyChange,
                externalAccountRequired: ca.directory.meta?.externalAccountRequired ?? false,
            }
        )
    }

    public async createAccount({ email, workspaceId }: { email: string, workspaceId: number }) {
        const client = await this.resolveInstance()
        await client.createAccount(email)

        const accountInfo = {
            jwk: await client.account.exportPrivateJwk(),
            email: client.account.email,
            accountUrl: client.account.accountUrl,
            authorityId: this.id,
            workspaceId
        }
        return AuthorityAccount.create(accountInfo)
    }
}
