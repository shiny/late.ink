import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Authority from 'App/Models/Authority'

export default class AuthorityController {
    public async index({ }: HttpContextContract) {
        return await Authority.query().where({
            type: 'production'
        })
    }
}
