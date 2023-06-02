import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AttachUserForSentry {
  public async handle({ sentry, auth, request }: HttpContextContract, next: () => Promise<void>) {
    if (sentry && auth && auth.isAuthenticated) {
        const user = auth.user
        if (user) {
            sentry.setUser({
                id: user.id.toString(),
                name: user.name,
                ip_address: request.ip()
            })
        }
    }
    await next()
  }
}
