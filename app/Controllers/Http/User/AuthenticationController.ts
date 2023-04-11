import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AuthenticationController {
    public async login({ auth, request }: HttpContextContract) {
        const user = request.input('name')
        const password = request.input('password')

        await auth.use('web').attempt(user, password)
        return {
            success: true,
        }
    }

    public async state({ auth }: HttpContextContract) {
        return {
            name: auth.user?.name,
            state: 'fine',
        }
    }
}
