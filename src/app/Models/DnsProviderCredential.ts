import { DateTime } from 'luxon'
import { belongsTo, BelongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import DnsProvider from './DnsProvider'
import BaseModel from './BaseModel'

export default class DnsProviderCredential extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public dnsProviderId: number

    @belongsTo(() => DnsProvider)
    public provider: BelongsTo<typeof DnsProvider>

    @column()
    public workspaceId: number

    @column()
    public name: string

    @column({
        consume: (value: string) => JSON.parse(value),
        prepare: (value: any) => JSON.stringify(value),
        serializeAs: null
    })
    @column() credentialConfig: Record<string, string>


    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime

    public async test() {
        const provider = await DnsProvider.findOrFail(this.dnsProviderId)
        return provider.testCredential(this.credentialConfig)
    }

    public async dns() {
        await (this as DnsProviderCredential).load('provider')
        return this.provider.dns(this.credentialConfig)
    }

    /**
     * @param domain 
     */
    public async hasDomain(domain: string) {
        const dns = await this.dns()
        return dns.instance.doesDomainExists(domain)
    }
}
