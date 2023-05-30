import { BaseCommand } from '@adonisjs/core/build/standalone'
import DetachedEvent from 'App/DetachedEvent'

export default class EventHealthy extends BaseCommand {
    public static commandName = 'event:healthy'
    public static description = 'Check event server healthy, exit code 0 on success'

    public static settings = {
        loadApp: true,
        stayAlive: false,
    }

    public async run() {
        try {
            await DetachedEvent.healthyCheck()
            this.logger.success('ScheduledEvent Server is healthy')
        } catch (err) {
            this.logger.error(err.message)
            this.exitCode = 1
            await this.exit()
        }
    }
}
