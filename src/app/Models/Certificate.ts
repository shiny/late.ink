import { DateTime } from 'luxon'
import { BelongsTo, belongsTo, column, computed, manyToMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import BaseModel from "./BaseModel"
import Workspace from './Workspace'
import CertificateOrder from './CertificateOrder'
import { X509Certificate } from 'node:crypto'
import Deployment from './Deployment'

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

    @manyToMany(() => Deployment, { pivotTable: 'deployment_certificates' })
    public deployments: ManyToMany<typeof Deployment>

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime

    @computed({
        serializeAs: null
    })
    get validToFromCrt(): DateTime | null {
        if (!this.crt) {
            return null
        }
        const cert = new X509Certificate(this.crt)
        return DateTime.fromJSDate(new Date(cert.validTo))
    }

    public toJSON() {
        return this.serialize({
            fields: {
                omit: ['validToFromCrt']
            },
            relations: {
                order: {
                    fields: {
                        omit: [ 'domains', 'createdAt', 'updatedAt']
                    },
                    relations: {
                        authority: {
                            fields: {
                                omit: ['directoryUrl', 'newNonce', 'newAccount', 'newOrder', 'revokeCert', 'keyChange', 'createdAt', 'updatedAt']
                            },
                        },
                        dnsProviderCredential: {
                            fields: {
                                omit: [ 'createdAt', 'updatedAt']
                            },
                            relations: {
                                provider: {
                                    fields: {
                                        omit: [ 'inputConfig', 'createdAt', 'updatedAt']
                                    }
                                }
                            }
                        }
                    }
                },
            }
        })
    }
}
