import Base from './Base'
import type { RecordOption } from '../'

type CloudflareConfig = {
    name: string
    token: string
}

function buildRecordName(record: Omit<RecordOption, "value"> & Partial<RecordOption>) {
    if (record.subdomain === '@') {
        return '@'
    } else {
        return `${record.subdomain}.${record.domain}`
    }
}
interface CloudflareApiBaseResponse {
    success: boolean
    errors?: any
}
type CloudflareApiResponse <T extends {}> = CloudflareApiBaseResponse & T

export default class Cloudflare extends Base {
    private endpoint = 'https://api.cloudflare.com/client/v4/'
    private token: string
    public name: string
    
    constructor(config?: CloudflareConfig) {
        super()
        this.useCred(config)
    }

    get headers() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        }
    }

    public async listSubdomainRecords(record: Omit<RecordOption, "value"> & Partial<RecordOption>): Promise<RecordOption[]> {
        const zoneId = await this.fetchZoneId(record.domain)
        const { success, result, errors } = await this.get<{
            success: boolean,
            result: any,
            errors: any
        }>(`zones/${zoneId}/dns_records`, {
            value: record.value,
            name: buildRecordName(record),
            type: record.type
        })
        if (!success) {
            this.throwCloudflareError(errors)
        }
        if (result.length === 0) {
            return []
        }
        return result.map(item => {
            return {
                domain: item.zone_name,
                subdomain: record.subdomain,
                value: item.content,
                type: item.type,
                rawId: `${item.zone_id}:${item.id}`,
                TTL: item.ttl
            } as RecordOption
        })
    }

    public async deleteById(rawId: `${string}:${string}`) {
        const [ zoneId, id ] = rawId.split(':')
        return this.delete(`zones/${zoneId}/dns_records/${id}`)
    }

    public async setRecord(record: RecordOption) {
        const zoneId = await this.fetchZoneId(record.domain)
        const { success, errors } = await this.post<CloudflareApiBaseResponse>(`zones/${zoneId}/dns_records`, {
            type: record.type,
            name: buildRecordName(record),
            content: record.value,
            // 1 means automatic
            // https://api.cloudflare.com/#dns-records-for-a-zone-create-dns-record
            ttl: record.TTL ?? 1
        })
        if (!success) {
            this.throwCloudflareError(errors)
        }
    }

    public useCred(config?: any) {
        if (config?.name) {
            this.name = config?.name
        }
        if (config?.token) {
            this.token = config.token
        }
    }

    public async testCred(config: CloudflareConfig) {
        const instance = config ? new Cloudflare(config) : this
        const { success, errors } = await instance.get<CloudflareApiBaseResponse>('user/tokens/verify')
        if (!success) {
            this.throwCloudflareError(errors)
        }
        return success
    }

    private async fetchZoneId(domain: string): Promise<string> {
        const { result: zoneResult } = await this.get<CloudflareApiResponse<{ result: any }>>('zones', {
            name: domain
        })
        if (!zoneResult[0]) {
            throw new Error(`${domain} not found`)
        }
        return zoneResult[0].id
    }

    public async doesDomainExists(hostname: string) {
        const domain = this.parseHostname(hostname).domain
        return this.fetchZoneId(domain || hostname)
    }

    private throwCloudflareError(errors) {
        const defaultError = errors[0]
        throw new Error(`Cloudflare error #${defaultError.code} ${defaultError.message}`)
    }

    private async get<T>(url, params?: Record<string, any>) {
        const buildRequestUrl = () => {
            const uri = `${this.endpoint}${url}`
            if (params) {
                return uri + '?' + (new URLSearchParams(params)).toString()
            } else {
                return uri
            }
        }
        const res = await this.fetch<T>(buildRequestUrl(), {
            headers: this.headers,
            throwHttpErrors: true,
        })
        return res.body
    }

    private async post<T>(url, body?: Record<string, any>) {
        const res = await this.fetch<T>(`${this.endpoint}${url}`, {
            headers: this.headers,
            method: 'POST',
            body: JSON.stringify(body),
        })
        return res.body
    }

    private async delete<T>(url) {
        const res = await this.fetch<T>(`${this.endpoint}${url}`, {
            headers: this.headers,
            method: 'DELETE',
        })
        return res.body
    }
}
