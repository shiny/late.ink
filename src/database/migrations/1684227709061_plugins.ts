import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { InstallFrom, PluginCategory, Status } from 'App/Models/Plugin'

export default class extends BaseSchema {
    protected tableName = 'plugins'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')
            table.string('package_name').unique()
            table.string('version')
            table.enum('plugin_category', Object.keys(PluginCategory))
            table.enum('install_from', Object.keys(InstallFrom))
            table.string('url')
            table.text('locales')
            table.text('input_config')
            table.text('icon')
            table.enum('status', Object.keys(Status))
            /**
             * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
             */
            table.timestamp('created_at', { useTz: true })
            table.timestamp('updated_at', { useTz: true })
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
