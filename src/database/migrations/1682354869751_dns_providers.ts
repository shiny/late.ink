import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'dns_providers'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').unique()
      table.string('link')
      table.string('input_config')
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })


    this.defer(async () => {
      await this.db.table(this.tableName).multiInsert([
        {
          name: 'Cloudflare',
          link: 'https://dash.cloudflare.com/profile/api-tokens',
          input_config: JSON.stringify([
            { name: 'name', type: 'text' },
            { name: 'token', type: 'password' }
          ]),
          created_at: new Date,
          updated_at: new Date
        },
        {
          name: 'Aliyun',
          link: 'https://ram.console.aliyun.com/manage/ak',
          input_config: JSON.stringify([
            { name: 'name', type: 'text' },
            { name: 'accessKeyId', type: 'text' },
            { name: 'accessKeySecret', type: 'password' },
          ]),
          created_at: new Date,
          updated_at: new Date
        }
      ])
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
