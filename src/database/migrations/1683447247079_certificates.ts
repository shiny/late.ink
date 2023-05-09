import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { Algorithm } from 'App/Models/Certificate'

export default class extends BaseSchema {
    protected tableName = 'certificates'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')

            table.string('domains')
            table.integer('workspace_id').index()
            table.integer('order_id').unique()
            table.enum("algorithm", Object.keys(Algorithm))
            table.text("csr")
            table.text("private_key")
            table.text("crt")
            table.timestamp('expired_at', { useTz: true })
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
