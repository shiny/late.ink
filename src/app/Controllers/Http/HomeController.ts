import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
// import DetachedEvent from 'App/DetachedEvent'
import Deployment from 'App/Models/Deployment'
// import Deployment from "App/Plugins/Deployment"

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

    public async index({  }: HttpContextContract) {
        // const plugin = await Deployment.from('@late.ink/plugin-ssh').load()
        //** */ @ts-expect-error
        // return await plugin.instance.execute('docker compose -f /data/late.ink/docker-compose.yml ps')
        // await DetachedEvent.emit('deploymentjob:execute', {})

        
        const deploy = await Deployment.findOrFail(4)
        await deploy.run()
        return 1
    }
}
