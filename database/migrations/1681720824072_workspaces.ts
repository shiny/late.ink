import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
    protected tableName = 'workspaces'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')
            table.boolean('is_personal')
            table.bigint('founder_id').index('founder_id')
            table.string('name')
            table.string('slug').index()
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
