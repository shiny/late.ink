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
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
