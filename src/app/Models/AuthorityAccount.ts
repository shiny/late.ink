import { DateTime } from 'luxon'
import { BelongsTo, belongsTo, column, scope } from '@ioc:Adonis/Lucid/Orm'
import Authority from './Authority'
import BaseModel from './BaseModel'

export default class AuthorityAccount extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public authorityId: number
  
  @column()
  public email: string

  @column()
  public workspaceId: number
  
  @column()
  public accountUrl: string

  @column({
    consume: (value: string) => JSON.parse(value),
    serializeAs: null
  })
  public jwk: string

  public static inWorkspace = scope((query, workspaceId: number) => {
    query.where('workspace_id', workspaceId)
  })

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
