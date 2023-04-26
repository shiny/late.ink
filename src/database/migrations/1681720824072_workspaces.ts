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


        this.defer(async () => {
            // Only executed when not running in dry-run mode
            await this.db.table(this.tableName).multiInsert([
                {
                    is_personal: 1,
                    founder_id: 1,
                    name: 'admin',
                    slug: 'admin',
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
