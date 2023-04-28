
import Env from '@ioc:Adonis/Core/Env'

const proxyConfig = {
    rule: Env.get('PROXY_RULE', 'none'),
    httpsProxy: Env.get('HTTPS_PROXY', ''),
    noProxy: Env.get('NO_PROXY', '').split(',')
}
export default proxyConfig
