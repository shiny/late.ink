import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { AuthorizationStatus } from 'App/Models/CertificateAuthorization'



export default class extends BaseSchema {
  protected tableName = 'certificate_authorizations'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.boolean('is_wildcard')
      table.enum('status', Object.keys(AuthorizationStatus))
      table.string('url')
      table.string('identifier_type')
      table.string('identifier_value')
      table.timestamp('expired_at', { useTz: true })
      table.integer('certificate_order_id').index()
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
