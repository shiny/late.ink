
import got, { Options, Response } from "got"
import { parse } from "tldts"
import { RecordOption } from ".."
import autoProxy from "App/Utils/Proxy"

export default abstract class Base {

    public timeout = 30 // seconds    
    public abstract useCred(config?: any)
    public abstract testCred(config?: any): Promise<boolean>

    /**
     * fetch API
     * `this.fetch`
     */
    @autoProxy
    async fetch<T>(url: string | URL, options?: Options): Promise<Response<T>> {
        
        return got(url, got.mergeOptions({
            throwHttpErrors: false,
            responseType: 'json',
            http2: true
        }, options ?? {})) as Promise<Response<T>>
    }
    public abstract deleteById(rawId: string)
    public abstract setRecord(record: RecordOption)
    public abstract listSubdomainRecords(record: Omit<RecordOption, 'value'>): Promise<RecordOption[]>
    public abstract doesDomainExists(hostname: string)
    public parseHostname(hostname: string) {
        return parse(hostname, {
            validateHostname: false
        })
    }
}
