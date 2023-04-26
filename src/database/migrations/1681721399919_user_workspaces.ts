import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
    protected tableName = 'user_workspaces'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')
            table.bigint('user_id')
            table.bigint('workspace_id')
            table.string('role')
            table.unique(['user_id', 'workspace_id'])
            table.timestamp('created_at', { useTz: true })
            table.timestamp('updated_at', { useTz: true })
        })
        this.defer(async () => {
            // Only executed when not running in dry-run mode
            await this.db.table(this.tableName).multiInsert([
                {
                    user_id: 1,
                    workspace_id: 1,
                    role: 'owner',
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
