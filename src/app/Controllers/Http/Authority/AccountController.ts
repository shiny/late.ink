import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Authority from 'App/Models/Authority'


export default class AccountController {
    public async store({ request, params, workspaceId }: HttpContextContract) {
        if (!workspaceId) {
            throw new Error('Session expired')
        }
        const { email } = await request.validate({
            schema: schema.create({
                email: schema.string([
                    rules.email()
                ])
            })
        })
        const authorityId = params['authorityId']
        const authority = await Authority.findOrFail(authorityId)
        // TODO: if account already exists in database, throw errors
        const account = await authority.createAccount({
            email,
            workspaceId
        })
        return account
    }

    public async index ({ params, workspaceId }: HttpContextContract) {
        if (!workspaceId) {
            throw new Error('Session expired')
        }
        const authorityId = params['authorityId']
        const authority = await Authority.findOrFail(authorityId)
        const accounts =await authority.related('accounts')
            .query()
            .withScopes((scopes) => scopes.inWorkspace(workspaceId))
        return accounts.map(account => account.serialize())
    }
}
