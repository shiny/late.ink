import Application from '@ioc:Adonis/Core/Application'
import Hash from '@ioc:Adonis/Core/Hash'
import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { string } from '@ioc:Adonis/Core/Helpers'
import fs from "node:fs"

export default class extends BaseSchema {
    protected tableName = 'users'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')
            table.string('name').unique()
            table.string('password')
            table.string('remember_me_token')

            /**
             * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
             */
            table.timestamp('created_at', { useTz: true })
            table.timestamp('updated_at', { useTz: true })
        })


        const randomPassword = string.generateRandom(12)

        // Do not record password in test environment
        if (process.env.NODE_ENV !== 'test') {
            const file = Application.tmpPath('random-admin-password.txt')
            fs.writeFileSync(file, randomPassword)
        }
        this.defer(async () => {
            // Only executed when not running in dry-run mode
            await this.db.table(this.tableName).multiInsert([
                {
                    name: 'admin',
                    password: await Hash.make(randomPassword),
                    created_at: new Date,
                    updated_at: new Date
                }
            ])
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
