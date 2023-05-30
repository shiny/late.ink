import { DateTime } from 'luxon'
import { column } from '@ioc:Adonis/Lucid/Orm'
import BaseModel from "./BaseModel"

export default class DeploymentCertificate extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public certificateId: number

  @column()
  public deploymentId: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
