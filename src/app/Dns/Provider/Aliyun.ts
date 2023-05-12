import crypto from "node:crypto"
import querystring from "node:querystring"
import Base from './Base'
import { RecordOption, isRecordType } from ".."
import { Options } from "got/dist/source"

function nonce() {
    return crypto.randomBytes(5).toString('hex')
}

/**
 * ISO string format example: `2022-12-05T11:28:24.514Z`
 * remove milliseconds part `.514`
 * @example
 * ```typescript
 * const time = createTimestamp()
 * // time === '2022-12-05T11:28:24Z'
 * ```
 * @returns example: '2022-12-05T11:28:24Z'
 */
function createTimestamp() {
    const date = (new Date()).toISOString()
    return date.replace(/\.[0-9]{3}/, '')
}

type AliyunDnsRecord = {
    Status: "Enable" | "Disable",
    Type: string
    Weight: number
    Value: string
    TTL: number
    Line: string
    RecordId: string
    Priority: number
    RR: string
    DomainName: string
    Locked: boolean
}

/**
 * sign for aliyun
 * @param method 
 * @param url 
 * @param secret 
 * @url https://help.aliyun.com/document_detail/315526.html#section-wml-y32-4a2
 * @returns 
 */
function sign(method: 'GET' | 'POST', url: URL, secret: string) {
    const canonicalizedQueryString = Array.from(url.searchParams.entries())
        .sort()
        .map((value: [string, string]) => value[0] + '=' + encodeURIComponent(value[1]))
        .join('&')

    const stringToSign = `${method}&${encodeURIComponent(url.pathname)}&${encodeURIComponent(canonicalizedQueryString)}`
    return crypto.createHmac('sha1', secret + '&')
        .update(stringToSign)
        .digest('base64')
}

function createGetSignature(url: URL, secret) {
    return sign('GET', url, secret)
}

type AliyunConfig = {
    name: string
    accessKeyId: string
    accessKeySecret: string
}

export default class Aliyun extends Base {

    private endpoint = 'https://alidns.aliyuncs.com'
    public name: string
    private accessKeyId: string
    private accessKeySecret: string
    public apiVersion = '2015-01-09'

    constructor(config?: any) {
        super()
        this.useCred(config)
    }

    useCred(config?: AliyunConfig) {
        if (config?.name) {
            this.name = config?.name
        }
        if (config?.accessKeyId) {
            this.accessKeyId = config.accessKeyId
        }
        if (config?.accessKeySecret) {
            this.accessKeySecret = config.accessKeySecret
        }
    }

    /**
     * test the credentials
     * throw Error on failed
     * @param config 
     */
    async testCred(config?: AliyunConfig) {
        const instance = config ? new Aliyun(config) : this
        const { Code, Message } = await instance.action<{ Code: string, Message: string }>({
            Action: 'DescribeDomains',
        }, {
            throwHttpErrors: false
        })
        if (Code && Message) {
            throw new Error(Code)
        } else {
            return true
        }
    }

    async action<ReturnType>(params, options?: Options) {
        const query = querystring.stringify({
            Format: "JSON",
            Version: this.apiVersion,
            AccessKeyId: this.accessKeyId,
            SignatureMethod: "HMAC-SHA1",
            Timestamp: createTimestamp(),
            SignatureVersion: "1.0",
            SignatureNonce: nonce(),
            Signature: '',
            ...params
        })
        const url = new URL(this.endpoint + '/?' + query)
        url.searchParams.delete('Signature')
        url.searchParams.append('Signature', createGetSignature(url, this.accessKeySecret))
        try {
            const result = await this.fetch<ReturnType>(url, {
                throwHttpErrors: true,
                ...options
            })
            return result.body
        } catch (error) {
            if (error.response) {
                console.error(`[${error.response.status}] body:`, error.response.body)
            }
            throw error
        }
    }

    async query(hostname: string) {
        const domain = this.parseHostname(hostname).domain
        return this.action({
            Action: "DescribeSubDomainRecords",
            DomainName: domain,
            SubDomain: hostname,
            Type: 'TXT',
        })
    }

    async doesDomainExists(hostname: string) {
        // Code: InvalidDomainName.NoExist
        const records = await this.query(hostname)
        return records
    }

    async setRecord({ domain, subdomain, value, type }) {
        await this.action({
            Action: 'AddDomainRecord',
            DomainName: domain,
            RR: subdomain,
            Value: value,
            Type: type
        })
    }

    async deleteById(rawId: string) {
        return this.action({
            Action: 'DeleteDomainRecord',
            RecordId: rawId
        })
    }

    async listSubdomainRecords({ domain, subdomain, type }): Promise<RecordOption[]> {

        const buildQueryDomain = (domain, subdomain) => {
            if (subdomain === '@') {
                return domain
            } else {
                return `${subdomain}.${domain}`
            }
        }

        const result = await this.action<{
            DomainRecords?: {
                Record?: AliyunDnsRecord[]
            }
        }>({
            Action: 'DescribeSubDomainRecords',
            SubDomain: buildQueryDomain(domain, subdomain),
            Type: type,
            DomainName: domain,
            PageSize: 500
        })
        if (!result?.DomainRecords?.Record) {
            return []
        }
        return (result.DomainRecords.Record).map(record => {
            const type = isRecordType(record.Type) ? record.Type : 'UNKNOWN'
            return {
                domain,
                subdomain: record.RR,
                value: record.Value,
                type,
                TTL: record.TTL,
                rawId: record.RecordId
            }
        })
    }
}
