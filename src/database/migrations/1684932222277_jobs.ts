import BaseSchema from '@ioc:Adonis/Lucid/Schema'

import { JobStatus } from 'App/Models/Job'

export default class extends BaseSchema {
    protected tableName = 'jobs'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')
            table.string('name')
            table.text('data')
            table.integer('outer_id').index()
            table.integer('workspace_id').index()
            table.integer('interval')
            table.timestamp('next_run_at', { useTz: true })
            table.enum('status', Object.keys(JobStatus))
            table.enum('last_run_status', Object.keys(JobStatus))
            table.timestamp('last_run_at')
            table.text('last_run_message')
            /**
             * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
             */
            table.timestamp('created_at', { useTz: true })
            table.timestamp('updated_at', { useTz: true })
        })
    }
    // deploy
    // deploymentId,

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
