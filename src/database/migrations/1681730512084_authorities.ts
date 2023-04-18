import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
    protected tableName = 'authorities'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')

            table.string('ca').notNullable()

            table.enum('type', ['staging', 'production']).defaultTo('production')

            table.string('directory_url')
            table.string('new_nonce')
            table.string('new_account')
            table.string('new_order')
            table.string('revoke_cert')
            table.string('key_change')
            table.boolean('external_account_required')
            /**
             * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
             */
            table.timestamp('created_at', { useTz: true })
            table.timestamp('updated_at', { useTz: true })
        })

        this.defer(async () => {
            // Only executed when not running in dry-run mode
            await this.db.from('users')
            await this.db.table(this.tableName).multiInsert([
                {
                    ca: 'LetsEncrypt',
                    type: 'production',
                    directory_url: 'https://acme-v02.api.letsencrypt.org/directory',
                    new_nonce: 'https://acme-v02.api.letsencrypt.org/acme/new-nonce',
                    new_account: 'https://acme-v02.api.letsencrypt.org/acme/new-acct',
                    new_order: 'https://acme-v02.api.letsencrypt.org/acme/new-order',
                    revoke_cert: 'https://acme-v02.api.letsencrypt.org/acme/revoke-cert',
                    key_change: 'https://acme-v02.api.letsencrypt.org/acme/key-change',
                    external_account_required: 0,
                },
                {
                    ca: 'LetsEncrypt',
                    type: 'staging',
                    directory_url: 'https://acme-staging-v02.api.letsencrypt.org/directory',
                    new_nonce: 'https://acme-staging-v02.api.letsencrypt.org/acme/new-nonce',
                    new_account: 'https://acme-staging-v02.api.letsencrypt.org/acme/new-acct',
                    new_order: 'https://acme-staging-v02.api.letsencrypt.org/acme/new-order',
                    revoke_cert: 'https://acme-staging-v02.api.letsencrypt.org/acme/revoke-cert',
                    key_change: 'https://acme-staging-v02.api.letsencrypt.org/acme/key-change',
                    external_account_required: 0,
                },
                {
                    ca: 'ZeroSSL',
                    type: 'production',
                    directory_url: 'https://acme.zerossl.com/v2/DV90/directory',
                    new_nonce: 'https://acme.zerossl.com/v2/DV90/newNonce',
                    new_account: 'https://acme.zerossl.com/v2/DV90/newAccount',
                    new_order: 'https://acme.zerossl.com/v2/DV90/newOrder',
                    revoke_cert: 'https://acme.zerossl.com/v2/DV90/revokeCert',
                    key_change: 'https://acme.zerossl.com/v2/DV90/keyChange',
                    external_account_required: 1,
                },
                {
                    ca: 'BuyPass',
                    type: 'production',
                    directory_url: 'https://api.buypass.com/acme/directory',
                    new_nonce: 'https://api.buypass.com/acme-v02/new-nonce',
                    new_account: 'https://api.buypass.com/acme-v02/new-acct',
                    new_order: 'https://api.buypass.com/acme-v02/new-order',
                    revoke_cert: 'https://api.buypass.com/acme-v02/revoke-cert',
                    key_change: 'https://api.buypass.com/acme-v02/key-change',
                    external_account_required: 0,
                },
                {
                    ca: 'BuyPass',
                    type: 'staging',
                    directory_url: 'https://api.test4.buypass.no/acme/directory',
                    new_nonce: 'https://api.test4.buypass.no/acme-v02/new-nonce',
                    new_account: 'https://api.test4.buypass.no/acme-v02/new-acct',
                    new_order: 'https://api.test4.buypass.no/acme-v02/new-order',
                    revoke_cert: 'https://api.test4.buypass.no/acme-v02/revoke-cert',
                    key_change: 'https://api.test4.buypass.no/acme-v02/key-change',
                    external_account_required: 0,
                },
            ])
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
