import { DateTime } from 'luxon'
import { BelongsTo, belongsTo, column, computed } from '@ioc:Adonis/Lucid/Orm'
import BaseModel from "./BaseModel"
import Workspace from './Workspace'
import CertificateOrder from './CertificateOrder'
import { X509Certificate } from 'node:crypto'

export enum Algorithm {
    'ECDSA',
    'RSA',
}
export type AlgorithmType = keyof typeof Algorithm

export default class Certificate extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column({
        prepare: (value: string[]) => value.join(','),
        consume: (value: string) => value.split(',')
    })
    public domains: string[]

    @column()
    public workspaceId: number

    @belongsTo(() => Workspace)
    public workspace: BelongsTo<typeof Workspace>

    @column()
    public orderId: number

    @belongsTo(() => CertificateOrder, {
        foreignKey: 'orderId'
    })
    public order: BelongsTo<typeof CertificateOrder>

    @column({
        serializeAs: null
    })
    public csr: string

    @column({
        serializeAs: null
    })
    public privateKey: string

    @column({
        serializeAs: null
    })
    public crt: string

    @column()
    public algorithm: AlgorithmType

    @column.dateTime()
    public expiredAt: DateTime

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime

    @computed()
    get validToFromCrt(): DateTime | null {
        if (!this.crt) {
            return null
        }
        const cert = new X509Certificate(this.crt)
        return DateTime.fromJSDate(new Date(cert.validTo))
    }
}
