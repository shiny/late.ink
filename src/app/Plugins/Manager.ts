import { IPluginInfo, PluginManager } from 'live-plugin-manager'
import Config from '@ioc:Adonis/Core/Config'
import { dependencies } from '../../package.json'
import Plugin, { PluginCategory } from 'App/Models/Plugin'
import { DeploymentPluginBase, DnsProviderPluginBase } from '@late.ink/plugin-base'

export default class Manager {

    pluginManager: PluginManager
    
    constructor() {
        const managerConfig = Config.get('plugin.manager')
        this.pluginManager = new PluginManager(managerConfig)
    }

    get localPackages() {
        return Object.keys(dependencies)
    }

    async queryNpmPackage(packageName) {
        return this.pluginManager.queryPackageFromNpm(packageName)
    }

    async getPackageMetaData(packageName: string): Promise<IPluginInfo> {
        const getMetaInfo = async (packageName: string): Promise<IPluginInfo | undefined> => {
            if (this.localPackages.includes(packageName)) {
                return (await import(`${packageName}/package.json`)).default
            } else {
                if (!this.pluginManager.alreadyInstalled(packageName)) {
                    await this.pluginManager.install(packageName)
                }
                return this.pluginManager.getInfo(packageName)
            }
        }
        const meta = await getMetaInfo(packageName)
        if (meta) {
            return meta
        } else {
            throw new Error(`Package ${packageName} not found`)
        }
    }

    async import<T>(packageName): Promise<T> {
        if (this.localPackages.includes(packageName)) {
            return (await import(packageName)).default
        } else {
            if (!this.pluginManager.alreadyInstalled(packageName)) {
                await this.pluginManager.install(packageName)
            }
            return this.pluginManager.require(packageName)
        }
    }

    async installPlugin(packageName) {
        const packgePlugin = await this.import<typeof DeploymentPluginBase | typeof DnsProviderPluginBase>(packageName)

        if (!this.isValidPlugin(packageName, packgePlugin)) {
            throw new Error(`Package ${packageName} is not a valid late plugin`)
        }

        const meta = await this.getPackageMetaData(packageName)

        const plugin = await Plugin.updateOrCreate({
            packageName,
        }, {
            packageName,
            version: meta.version,
            pluginCategory: packgePlugin.category,
            installFrom: 'NpmRegistry',
            url: packageName,
            locales: packgePlugin.locales,
            inputConfig: packgePlugin.inputConfig,
            icon: packgePlugin.icon,
            status: 'Valid'
        })
        return plugin
    }

    isValidPlugin(packageName, plugin) {
        const categories = Object.values(PluginCategory)
        if (!categories.includes(plugin.category)) {
            throw new Error(`Package ${packageName} is not a valid late plugin`)
        }
        switch (categories.indexOf(plugin.category)) {
            case PluginCategory.Deployment:
                return plugin.prototype instanceof DeploymentPluginBase
            case PluginCategory.DnsProvider:
                return plugin.prototype instanceof DnsProviderPluginBase
            default:
                throw new Error(`unknow category ${plugin.category}`)
        }
    }
}
