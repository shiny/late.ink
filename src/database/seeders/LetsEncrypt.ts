import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Authority from 'App/Models/Authority'

export default class extends BaseSeeder {
    public static environment = ['development', 'production']
    public async run() {
        await Authority.discoverAndSave('LetsEncrypt', 'production')
        await Authority.discoverAndSave('LetsEncrypt', 'staging')
    }
}
