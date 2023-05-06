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
    serializeAs: null
  })
  @column() credentialConfig: string
  

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
