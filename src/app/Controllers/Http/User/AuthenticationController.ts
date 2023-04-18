import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Workspace from 'App/Models/Workspace'

export default class AuthenticationController {
    public async login({ auth, request, session }: HttpContextContract) {
        const user = request.input('name')
        const password = request.input('password')

        await auth.use('web').attempt(user, password)
        const workspaces = await Workspace.query().where({
            founderId: auth.use('web').user?.id,
            isPersonal: true,
        })

        if (workspaces.length === 0) {
            throw new Error(`User default personal workerspace not found`)
        }

        const personalWorkspaceId = workspaces[0].id
        session.put('workspace_id', personalWorkspaceId)

        return {
            workspace: personalWorkspaceId,
            success: true,
        }
    }

    public async state({ auth, session }: HttpContextContract) {
        return {
            name: auth.user?.name,
            workspaceId: session.get('workspace_id'),
        }
    }
}
