import { DateTime } from 'luxon'
import { column } from '@ioc:Adonis/Lucid/Orm'
import BaseModel from './BaseModel'

export default class UserWorkspace extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public userId: number

    @column()
    public workspaceId: number

    @column()
    public role: string

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime
}
