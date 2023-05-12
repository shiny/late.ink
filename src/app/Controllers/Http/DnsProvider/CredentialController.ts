import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import DnsProvider from 'App/Models/DnsProvider'
import DnsProviderCredential from 'App/Models/DnsProviderCredential'
import DnsProviderCredentialValidator from 'App/Validators/DnsProviderCredentialValidator'

export default class CredentialController {
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

    public async index({ params, workspaceId, request }: HttpContextContract) {
        const prePage = 12
        const page = request.input('page', 1)
        const credentials = DnsProviderCredential.query().where({
            workspaceId,
        }).preload('provider')
        const providerId = parseInt(params['providerId'])
        if (providerId) {
            credentials.where({
                dnsProviderId: params['providerId']
            })
        }

        return (await credentials.paginate(page, prePage)).serialize({
            fields: {
                omit: ['workspace_id', 'created_at', 'updated_at']
            },
            relations: {
                provider: {
                    fields: {
                        pick: ['id', 'name']
                    }
                }
            }
        })
    }

    public async store({ request, params, workspaceId }: HttpContextContract) {
        try {
            await DnsProvider.findOrFail(params['providerId'])
            const form = await request.validate(DnsProviderCredentialValidator)
            const credentialConfig = request.all()
            delete credentialConfig['providerId']
            delete credentialConfig['name']
            const credential = await DnsProviderCredential.updateOrCreate({
                workspaceId,
                name: form['name']
            }, {
                workspaceId,
                dnsProviderId: params['providerId'],
                credentialConfig: credentialConfig
            })
            return credential
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
