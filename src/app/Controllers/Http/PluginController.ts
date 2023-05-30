import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext"
import HttpNotFoundException from "App/Exceptions/HttpNotFoundException"
import Plugin from "App/Models/Plugin"

export default class PluginController {
    async show({ params }: HttpContextContract) {
        const pluginId = params['id']
        const plugin = await Plugin.find(pluginId)
        if (!plugin) {
            throw new HttpNotFoundException(`Plugin not found`)
        }
        return plugin.serialize()
    }

    async index({ request }: HttpContextContract) {
        const type = request.input('type')
        const page = request.input('page')
        const perPage = 12
        const plugins = Plugin.query()
        if (type) {
            plugins.where({
                pluginCategory: type
            })
        }
        return plugins.paginate(page, perPage)
    }
}
