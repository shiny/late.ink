import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class Workspace {
    public async handle(
        ctx: HttpContextContract,
        next: () => Promise<void>
    ) {
        if (!ctx.session.has('workspace_id')) {
            if(ctx.auth.isAuthenticated) {
                await ctx.auth.logout()
                return ctx.response.unauthorized({
                    error: 'unauthorized'
                })
            }
        }
        ctx.workspaceId = ctx.session.get('workspace_id')
        await next()
    }
}
