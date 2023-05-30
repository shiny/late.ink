import type { EventsList } from '@ioc:Adonis/Core/Event'
import Deployment from 'App/Models/Deployment'
import Job from 'App/Models/Job'
import Logger from '@ioc:Adonis/Core/Logger'
import { DateTime } from 'luxon'

export default class DeploymentJob {
    public async onExecute({ id }: EventsList['deploymentjob:execute']) {

        const job = await Job.query().where({
            id,
            status: 'Available'
        }).firstOrFail()
        
        job.status = 'Running'
        await job.save()
        job.lastRunAt = DateTime.now()
        try {
            const deploy = await Deployment.findOrFail(job.outerId)
            job.lastRunStatus = 'Accomplished'
            job.lastRunMessage = ''
            await deploy.run()
        } catch (err) {
            job.lastRunStatus = 'Error'
            job.lastRunMessage = err.message
            Logger.error(err)
            throw err
        } finally {
            job.status = 'Available'
            await job.save()
        }
    }
}
