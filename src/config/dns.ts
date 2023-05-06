import Env from '@ioc:Adonis/Core/Env'
const defaultNameServer = '8.8.4.4,223.5.5.5'
import { ResolverOptions  } from 'node:dns'

interface DnsConfig {
    nameservers: string[]
    timeout: ResolverOptions["timeout"],
    tries: ResolverOptions["tries"]
}

function DnsConfig(): DnsConfig {
    return {
        nameservers: Env.get('DNS_NAMESEVER', defaultNameServer).split(','),
        timeout: Env.get('DNS_TIMEOUT', -1),
        tries: Env.get('DNS_TRIES', 4),
    }
}
export default DnsConfig()
