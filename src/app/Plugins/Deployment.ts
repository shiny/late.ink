import Manager from "./Manager"
import { DeploymentPluginBase, Certificate } from '@late.ink/plugin-base'

export default class Deployment {

    instance: DeploymentPluginBase
    manager
    constructor(protected pluginName: string, protected pluginConfig?: any) {
        this.manager = new Manager
    }

    static from(pluginName: string, pluginConfig?: any) {
        return new Deployment(pluginName, pluginConfig)
    }

    async load() {
        const Plugin = await this.manager.import(this.pluginName)
        this.instance = new Plugin(this.pluginConfig)
        if (this.instance instanceof DeploymentPluginBase) {
            return this
        } else {
            throw new Error(`${this.pluginName} is not a deployment plugin`)
        }
    }

    async test() {
        return this.instance.test()
    }

    async run(cert: Certificate) {
        return this.instance.run(cert)
    }
}