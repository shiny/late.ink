import { BaseCommand, Exception, args, flags } from '@adonisjs/core/build/standalone'

export default class UserResetpwd extends BaseCommand {
    public static commandName = 'user:resetpwd'

    public static description = 'Reset a random password for <user>'

    public static settings = {
        loadApp: true,
        stayAlive: false,
    }

    @args.string({
        description: 'user name',
    })
    public user: string

    @flags.boolean({
        description: 'yes i confirm',
        alias: 'y',
    })
    public yes: boolean

    @flags.number({
        description: 'the length of this random password',
    })
    public size: number = 9

    public async run() {
        try {
            await this.prepare()
            const password = await this.resetPassword(this.user)
            this.logger.success(
                `password for ${this.user} has been reset to: ${this.colors.green(password)}`
            )
        } catch (err) {
            this.logger.error(err)
        }
    }

    public async prepare() {
        if (!this.yes) {
            this.logger.info('use --yes or -y to confirm')
            await this.exit()
        }
    }

    public onErrorCaptured(err) {
        console.log(err)
    }

    public async resetPassword(userName: string) {
        try {
            const User = (await import('App/Models/User')).default
            const user = await User.findByOrFail('name', userName)
            const password = User.generateRandomizePassword(this.size)
            user.password = password
            await user.save()
            return password
        } catch (e) {
            switch (e.code) {
                case 'E_ROW_NOT_FOUND':
                    throw new Exception(`User ${this.colors.green(userName)} Not Found`)
                default:
                    throw new Exception('Reset error: ' + e.code)
            }
        }
    }
}
