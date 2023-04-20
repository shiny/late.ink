import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class Workspace {
    public async handle(
        ctx: HttpContextContract,
        next: () => Promise<void>
    ) {
        ctx.workspaceId = ctx.session.get('workspace_id')
        await next()
    }
}
