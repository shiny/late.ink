import { DateTime } from 'luxon'
import BaseModel from './BaseModel'
import { ModelQueryBuilderContract, beforeFetch, beforeFind, column, scope } from '@ioc:Adonis/Lucid/Orm'

export enum InstallFrom {
    NpmRegistry,
    Github,
    Path
}

export enum Status {
    Valid,
    Invalid,
    Disabled
}

export enum PluginCategory {
    Deployment,
    DnsProvider,
}

export type InstallFromType = keyof typeof InstallFrom
export type StatusType = keyof typeof Status
export type PluginCategoryType = keyof typeof PluginCategory

export default class Plugin extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public packageName: string

    @column()
    public version: string

    @column()
    public pluginCategory: PluginCategoryType

    @column()
    public installFrom: InstallFromType

    @column()
    public url: string

    @column({
        consume: (value: string) => JSON.parse(value),
        prepare: (value: any) => JSON.stringify(value),
    })
    public locales: Record<string, Record<string, any>>

    @column({
        consume: (value: string) => JSON.parse(value),
        prepare: (value: any) => JSON.stringify(value),
    })
    public inputConfig: Record<string, string>[]

    @column()
    public icon: string

    @column()
    public status: StatusType

    @beforeFind()
    @beforeFetch()
    public static ensureValid(query: ModelQueryBuilderContract<typeof Plugin>) {
        query.withScopes(scopes => scopes.valid())
    }

    public static valid = scope((query) => {
        query.where('status', 'Valid')
    })


    @column.dateTime({ autoCreate: true, serializeAs: null })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
    public updatedAt: DateTime
}
