import { DateTime } from 'luxon'
import BaseModel from './BaseModel'
import { BelongsTo, belongsTo, column, hasMany, HasMany, manyToMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import Workspace from './Workspace'
import Plugin from './Plugin'
import DeploymentPlugin from 'App/Plugins/Deployment'
import Certificate from './Certificate'
import Job from './Job'

export default class Deployment extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public name: string

    @column()
    public pluginId: number

    @belongsTo(() => Plugin)
    public plugin: BelongsTo<typeof Plugin>

    @column()
    public workspaceId: number

    @belongsTo(() => Workspace)
    public workspace: BelongsTo<typeof Workspace>

    @column({
        consume: (value: string) => JSON.parse(value),
        prepare: (value: any) => JSON.stringify(value),
        serializeAs: null
    })
    @column() pluginConfig: Record<string, string>

    @manyToMany(() => Certificate, { pivotTable: 'deployment_certificates' })
    public certificates: ManyToMany<typeof Certificate>

    @hasMany(() => Job, { foreignKey: 'outerId', onQuery: (query) => {
        query
            .where('jobs.name', 'Deploy')
            .orderBy('jobs.id', 'desc')
            .limit(1)
    }})
    public jobs: HasMany<typeof Job>
  
    @column.dateTime({ autoCreate: true, serializeAs: null })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
    public updatedAt: DateTime

    async resolve() {
        const packageName = async () => {
            if (this.$isPersisted) {
                await (this as Deployment).load('plugin')
                return this.plugin.packageName
            } else {
                const plugin = await Plugin.findOrFail(this.pluginId)
                return plugin.packageName
            }
        }
        return DeploymentPlugin.from(await packageName(), this.pluginConfig).load()
    }

    async run() {
        if (!this.certificates) {
            await (this as Deployment).load('certificates')
        }
        const plugin = await this.resolve()
        for(const cert of this.certificates) {
            try {
                await plugin.run({
                    domains: cert.domains,
                    crt: cert.crt,
                    privateKey: cert.privateKey,
                    csr: cert.csr,
                    algorithm: cert.algorithm,
                    expiredAt: cert.expiredAt.toJSDate()
                })
            } catch (err) {
                console.error(err)
                throw err
            }
        }
    }
}
