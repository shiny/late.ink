import { BaseCommand, args } from '@adonisjs/core/build/standalone'
import { UserExistsError } from 'App/Models/User'

export default class UserCreate extends BaseCommand {
    public static commandName = 'user:create'

    @args.string({
        description: 'user name',
    })
    public user: string

    public static description = 'Create a user'
    private passwordSize = 9

    public static settings = {
        loadApp: true,
        stayAlive: false,
    }

    public async run() {
        try {
            const password = await this.create(this.user)
            this.logger.info(
                `\nUserName: ${this.colors.green(this.user)},\npassword: ${this.colors.green(
                    password
                )}`
            )
        } catch (err) {
            this.logger.error(err)
        }
    }

    public async create(userName: string) {
        try {
            const User = (await import('App/Models/User')).default
            const password = await User.register({
                userName,
                passwordSize: this.passwordSize,
            })
            return password
        } catch (err) {
            if (err instanceof UserExistsError) {
                throw new Error(`User ${this.colors.green(userName)} already exists`)
            } else {
                throw err
            }
        }
    }
}
