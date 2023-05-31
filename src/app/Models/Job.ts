import { DateTime } from 'luxon'
import { column } from '@ioc:Adonis/Lucid/Orm'
import BaseModel from './BaseModel'

export enum JobStatus {
    Available,
    Pending,
    Running,
    Accomplished,
    Unavailable,
    Disabled,
    Error,
}

export type JobStatusType = keyof typeof JobStatus

export default class Job extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public name: string

    @column({
        prepare: (value: any) => JSON.stringify(value),
        consume: (value: string) => JSON.parse(value)
    })
    public data: any

    @column()
    public outerId: number


    @column()
    public workspaceId: number

    @column()
    public interval: number

    @column.dateTime()
    public nextRunAt: DateTime
    
    @column()
    public status: JobStatusType

    @column()
    public lastRunAt: DateTime
    @column()
    public lastRunStatus: JobStatusType
    @column()
    public lastRunMessage: string

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime
}
