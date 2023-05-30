export default abstract class DnsProviderPluginBase {
    /**
     * this is a DnsProvider plugin
     * set the dns text record on ACME authorization
     */
    public static category: 'DnsProvider' = 'DnsProvider'
    public static inputConfig: Record<string, any>[]
    public static locales: Record<string, Record<string, any>>
    public static icon: string
    
    constructor() {
        throw new Error(`DnsProviderPluginBase hasn't been implemted yet`)
    }
    abstract test(): Promise<boolean>
    abstract run(): Promise<boolean>
}


export interface DnsProviderPluginContract extends DnsProviderPluginBase {

}
