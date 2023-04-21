import { DateTime } from 'luxon'
import { BaseModel, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import ACME, { Ca } from 'handyacme'
import AuthorityAccount from './AuthorityAccount'

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

    @column()
    public newNonce: string

    @column()
    public newAccount: string

    @column()
    public newOrder: string

    @column()
    public revokeCert: string

    @column()
    public keyChange: string

    @column()
    public externalAccountRequired: boolean

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime

    @hasMany(() => AuthorityAccount)
    public accounts: HasMany<typeof AuthorityAccount>

    private acmeInstance: Ca

    public async resolveInstance(): Promise<Ca> {
        if (!this.acmeInstance) {
            this.acmeInstance = await ACME.create(this.ca, this.type)
        }
        return this.acmeInstance
    }

    public static async discoverAndSave(
        authorityName: AvailableAuthority,
        type: AvailableEnvironment
    ) {
        const ca = await ACME.create(authorityName, type)
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
