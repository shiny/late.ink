import { PluginManager ,PluginManagerOptions } from 'live-plugin-manager'
import Env from '@ioc:Adonis/Core/Env'
new PluginManager()
interface PluginConfig {
    manager: Partial<PluginManagerOptions>
}

const pluginConfig: PluginConfig = {
    manager: {
        npmRegistryUrl: Env.get('NPM_REGISTRY_URL', 'https://registry.npmjs.org/')
    }
}
export default pluginConfig
