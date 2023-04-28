
import { parse } from "tldts"
import type Base from "./Provider/Base"

interface ParseResult {
    hostname: string | null
    isIp: boolean | null
    subdomain: string | null
    domain: string
    publicSuffix: string | null
    domainWithoutSuffix: string | null
    isIcann: boolean | null
    isPrivate: boolean | null
}

export type RecordOption = {
    domain: string,
    subdomain: string,
    value: string,
    type: 'TXT' | 'A' | 'AAAA' | 'CNAME' | 'UNKNOWN',
    rawId?: string | number,
    TTL?: number
}

export function isRecordType(type: string): type is RecordOption["type"] {
    return [ 'TXT', 'A', 'AAAA', 'CNAME', 'UNKNOWN' ].includes(type)
}
import Aliyun from "./Provider/Aliyun"
import Cloudflare from "./Provider/Cloudflare"
const providers = {
    Aliyun,
    Cloudflare
}

export default class Dns {

    public instance: Base

    public static load(fileName: string, config?: any) {
        const dns = new Dns
        dns.instance = new providers[fileName](config)
        return dns
    }

    async useCred(config?: any) {
        return this.instance.useCred(config)
    }

    async testCred(config?: any) {
        return this.instance.testCred(config)
    }

    /**
     * search value in the specified hostname
     * @param hostname 
     * @param value 
     */
    public async doesTxtRecordExist(hostname: string, value): Promise<boolean> {
        const record = await this.findTxtRecord(hostname, value)
        return !!record
    }

    parseDomain(hostname: string): ParseResult {
        const result = parse(hostname, {
            validateHostname: false
        })
        if (!result.domain) {
            throw new Error(`can't parse domain ${hostname}`)
        } else {
            return result as ParseResult
        }
    }

    public async findTxtRecord(hostname: string, value: string) {
        const { domain, subdomain } = this.parseDomain(hostname)
        const records = await this.instance.listSubdomainRecords({
            domain,
            subdomain: subdomain ?? '@',
            type: 'TXT'
        })
        return records.find(record => record.value === value)
    }

    /**
     * search domain name in dns provider
     * and set value if it doest not exist
     * @param dns 
     * @param subdomain 
     * @param value 
     * @return boolean false on exists, return true on set
     */
    public async setTxtRecord(hostname: string, value: string) {
        const { domain, subdomain } = this.parseDomain(hostname)
        const record = await this.findTxtRecord(hostname, value)
        if (record) {
            return false
        } else {
            await this.instance.setRecord({
                domain,
                subdomain: subdomain ?? '@',
                type: 'TXT',
                value
            })
            return true
        }
    }

    public async deleteTxtRecord(hostname: string, value: string) {
        const record = await this.findTxtRecord(hostname, value)
        if (!record) {
            return false
        }
        if (!record.rawId) {
            throw new Error(`rawId is required`)
        }
        await this.instance.deleteById(record.rawId.toString())
        return true
    }
}
