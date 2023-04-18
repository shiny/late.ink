import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import ACME from 'handyacme'

export type AvailableAuthority = 'LetsEncrypt' | 'ZeroSSL' | 'BuyPass'
export type AvailableEnvironment = 'staging' | 'production'

export default class Authority extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public ca: string

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

    public static async discoverAndSave(
        authorityName: AvailableAuthority,
        type: AvailableEnvironment
    ) {
        const ca = await ACME.create(authorityName, type)
        return await Authority.updateOrCreate(
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
}
