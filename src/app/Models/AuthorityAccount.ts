import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

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
    consume: (value: string) => JSON.parse(value)
  })
  public jwk: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
