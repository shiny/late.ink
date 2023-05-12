import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import DnsProvider from 'App/Models/DnsProvider'
import DnsProviderCredentialValidator from 'App/Validators/DnsProviderCredentialValidator'

export default class ProviderController {

    public async index ({ }: HttpContextContract) {
        const providers = await DnsProvider.all()
        return providers.map(item => item.serialize())
    }
    
    public async test({ request, params }: HttpContextContract) {
        try {
            await request.validate(DnsProviderCredentialValidator)
                const provider = await DnsProvider.findOrFail(params['providerId'])
                await provider.testCredential(request.all())
            return {
                success: true
            }
        } catch (err) {
            return {
                success: false,
                errors: [
                    { message: err.message }
                ]
            }
        }
    }
}
