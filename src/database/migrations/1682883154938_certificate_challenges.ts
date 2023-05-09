import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { ChanllengeStatus, ChanllengeType } from 'App/Models/CertificateChallenge'

export default class extends BaseSchema {
  protected tableName = 'certificate_challenges'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.enum('type', Object.keys(ChanllengeType))
      table.enum('status', Object.keys(ChanllengeStatus))
      table.string('url')
      table.string('token')
      table.string('signkey')
      table.integer('certificate_authorization_id').index()
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
