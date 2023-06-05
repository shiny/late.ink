import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { OrderStatus } from 'App/Models/CertificateOrder'
export default class extends BaseSchema {
  protected tableName = 'certificate_orders'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('domains')
      table.string('url')
      table.string('certificate_url')
      table.string('finalize_url')
      table.enum("status", Object.keys(OrderStatus))
      table.timestamp('expired_at', { useTz: true })


      table.integer('authority_id').index()
      table.integer('workspace_id').index()
      table.integer('authority_account_id').index()
      table.integer('certificate_id').index()
      table.integer('dns_provider_credential_id').index()

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
