import { BaseCommand } from '@adonisjs/core/build/standalone'
import Config from '@ioc:Adonis/Core/Config'
import DetachedEvent from 'App/DetachedEvent'
import Cron from 'croner'
import Event from '@ioc:Adonis/Core/Event'

export default class DetachedEventStart extends BaseCommand {
    public static commandName = 'event:start'
    public static description = 'Start a stand-alone Event Server'

    public static settings = {
        loadApp: true,
        stayAlive: true,
    }

    public async run() {
        const server = Config.get('detachedevent.server')
        DetachedEvent.createServer().listen(server, () => {
            this.logger.info(`ScheduledEvent Server start at ${this.colors.green(`tcp://${server.host}:${server.port}`)}`)
        })
            .on('close', () => {
                this.exit()
            })
    }

    public async runSchedule() {
        const everyFiveMinutes = '*/5 * * * *'
        Cron(everyFiveMinutes, async () => {
            await Event.emit('schedule:run', {})
        })
    }
}
