import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import DnsProvider from 'App/Models/DnsProvider'

export default class ProviderController {

    public async index ({ }: HttpContextContract) {
        const providers = await DnsProvider.all()
        return providers.map(item => item.serialize())
    }
    
}
