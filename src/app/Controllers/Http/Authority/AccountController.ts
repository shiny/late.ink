import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Authority from 'App/Models/Authority'
import AuthorityAccount from 'App/Models/AuthorityAccount'


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

    public async index({ params, workspaceId, request }: HttpContextContract) {
        const prePage = 12
        const page = request.input('page', 1)
        if (!workspaceId) {
            throw new Error('Session expired')
        }
        const authorityId = parseInt(params['authorityId'])
        const model = AuthorityAccount.query().where({
            workspaceId,
        }).preload('authority')
        if (authorityId) {
            model.where({ authorityId })
        }
        return (await model.paginate(page, prePage)).serialize()
    }
}
