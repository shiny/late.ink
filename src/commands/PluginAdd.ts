import { BaseCommand, args } from '@adonisjs/core/build/standalone'
import Manager from 'App/Plugins/Manager'

export default class PluginAdd extends BaseCommand {
    /**
     * Command name is used to run the command
     */
    public static commandName = 'plugin:add'

    /**
     * Command description is displayed in the "help" output
     */
    public static description = ''

    @args.string({
        description: 'package name',
    })
    public package: string

    public static settings = {
        loadApp: true,
        stayAlive: false,
    }

    public async run() {
        try {
            const manager = new Manager
            await manager.installPlugin(this.package)
            this.logger.success(`Plugin ${this.package} installed`)
        } catch (err) {
            this.logger.error(err.message)
        }
    }
}
