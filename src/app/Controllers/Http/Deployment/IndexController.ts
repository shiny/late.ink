import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext"
import Database from "@ioc:Adonis/Lucid/Database"
import HttpNotFoundException from "App/Exceptions/HttpNotFoundException"
import Certificate from "App/Models/Certificate"
import DeploymentModel from "App/Models/Deployment"
import Job from "App/Models/Job"
import Plugin from "App/Models/Plugin"
import DetachedEvent from "App/DetachedEvent"

export default class IndexController {

    async index({ request, workspaceId }: HttpContextContract) {
        const page = request.input('page', 1)
        const perPage = 12
        const result = await DeploymentModel.query()
            .where({
                workspaceId
            })
            .orderBy('id', 'desc')
            .preload('certificates')
            .preload('plugin')
            .paginate(page, perPage)
        return result.serialize({
            relations: {
                plugin: {
                    fields: {
                        omit: ['inputConfig', 'createdAt', 'updatedAt']
                    }
                }
            }
        })
    }

    async create({ request }: HttpContextContract) {
        const pluginId = request.input('plugin_id', 0)
        const plugin = await Plugin.find(pluginId)
        if (!plugin || plugin.pluginCategory !== 'Deployment') {
            throw new HttpNotFoundException(`Plugin not found`)
        }

        return plugin.serialize()
    }

    async validate({ request, workspaceId }: HttpContextContract) {
        if (!workspaceId) {
            throw new Error('workspaceId is missing')
        }
        const pluginId = request.input('pluginId')
        const deployment = new DeploymentModel
        deployment.workspaceId = workspaceId
        deployment.pluginId = pluginId
        deployment.pluginConfig = request.input('pluginConfig')
        try {
            const pluginDeployment = await deployment.resolve()
            const success = await pluginDeployment.test()
            return {
                success
            }
        } catch (err) {
            return {
                success: false,
                errors: [
                    { message: err.message, code: err.code }
                ]
            }
        }
    }

    async trigger({ params, workspaceId }: HttpContextContract) {
        const job = await Job.query().where({
            name: 'Deploy',
            outerId: params['id'],
            workspaceId,
        }).first()
        if (!job) {
            throw new Error('Job not found')
        }
        if (job.status !== 'Available') {
            throw new Error('you can only trigger an avaiable job')
        }
        await DetachedEvent.emit('deploymentjob:execute', { id: job.id })
        return {
            success: true
        }
    }

    async store({ request, workspaceId }: HttpContextContract) {
        if (!workspaceId) {
            throw new Error('WorkspaceId required')
        }
        const name = request.input('name')
        const pluginId = request.input('pluginId')
        const pluginConfig = request.input('pluginConfig')
        const certId = request.input('certId')
        const immediate = request.input('immediate')

        const deployment = new DeploymentModel
        deployment.pluginId = pluginId
        deployment.pluginConfig = request.input('pluginConfig')
        const pluginDeployment = await deployment.resolve()
        const success = await pluginDeployment.test()

        await Plugin.query().where({
            id: pluginId,
            status: 'Valid'
        }).firstOrFail()

        await Database.transaction(async trx => {
            deployment.useTransaction(trx)
            const cert = await Certificate.findOrFail(certId, { client: trx })
            deployment.$setRelated('certificates', [ cert ])
            deployment.name = name
            deployment.workspaceId = workspaceId
            await deployment.save()

            const model = await DeploymentModel.updateOrCreate({
                name,
                workspaceId
            }, {
                name,
                pluginId,
                workspaceId,
                pluginConfig,
            }, { client: trx })
            await model.related('certificates').attach([ cert.id ], trx)
            const job = await Job.create({
                name: 'Deploy',
                data: {
                    deploymentId: model.id
                },
                workspaceId,
                outerId: model.id,
                status: 'Available',
            }, { client: trx })
            if (immediate) {
                DetachedEvent.emit('deploymentjob:execute', {
                    id: job.id
                })
            }
        })
        return {
            success
        }
    }
}
