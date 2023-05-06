import { DateTime } from 'luxon'
import { column } from '@ioc:Adonis/Lucid/Orm'
import Dns from "App/Dns"
import BaseModel from './BaseModel'

export default class DnsProvider extends BaseModel {

  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public link: string

  @column({
    consume: (value: string) => JSON.parse(value),
  })
  public inputConfig: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  public async testCredential(credential: Record<string, string>) {
    return Dns.load(this.name).testCred(credential)
  }

  public async listTxtRecords(config, domain: string) {
    return Dns.load(this.name, config).instance.doesDomainExists(domain)
  }
}

export interface InputItem {
  name: string
  type: "password" | "text"
}
