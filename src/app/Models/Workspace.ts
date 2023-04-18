import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Workspace extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public isPersonal: boolean

    @column()
    public founderId: number

    @column()
    public name: string

    @column()
    public slug: string

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime
}
