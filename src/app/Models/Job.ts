import { DateTime } from 'luxon'
import { BelongsTo, belongsTo, column, scope } from '@ioc:Adonis/Lucid/Orm'
import BaseModel from './BaseModel'
import Certificate from './Certificate'

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

    @belongsTo(() => Certificate, {
        localKey: 'outerId',
        onQuery(query) {
            query.where('name', 'Renew')
        },
    })
    public certificate: BelongsTo<typeof Certificate>

    public static punctual = scope((query, type: 'Renew' | 'Deploy') => {
        const now = DateTime.now().toSQL()
        if (!now) {
            throw new Error('Could not get DateTime.now()')
        }
        return query
            .where('nextRunAt', '<=', now)
            .where('name', type)
            .where('status', 'Available')
    })

    public async run() {
        if (this.status !== 'Available') {
            throw new Error('Only status Available could accept when running a Job')
        }
        switch (this.name) {
            case 'Renew':
                return this.runRenewal()
            default:
                throw new Error(`Job type ${this.name} has not been supported`)
        }
    }

    private async runRenewal() {
        this.status = 'Running'
        await this.save()
        try {
            await (this as Job).load('certificate')
            await this.certificate.load('order')
            // const duplicatedOrder = this.certificate.order
            // 1. create a new order
            // 2. create a one-time job to process this order at intervals
        } catch (err) {
            await this.updateLastRun('Error', err.message)
            this.status = 'Available'
            await this.save()
        }
    }

    private async updateLastRun(status: JobStatusType, message: string) {
        this.lastRunMessage = message
        this.lastRunStatus = status
        this.lastRunAt = DateTime.now()
        await this.save()
    }
}
