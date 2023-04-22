import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class HomeController {
    public async login({ session, request }: HttpContextContract) {
        session.put('user', request.input('name'))
        return {
            status: 'ok',
            name: session.get('name'),
        }
    }

    public async userState({ session }: HttpContextContract) {
        return {
            user: session.get('name'),
        }
    }
}
