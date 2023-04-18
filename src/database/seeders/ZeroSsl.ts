import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Authority from 'App/Models/Authority'

export default class extends BaseSeeder {
    public async run() {
        // there is no staging environment in ZeroSSL
        await Authority.discoverAndSave('ZeroSSL', 'production')
    }
}
