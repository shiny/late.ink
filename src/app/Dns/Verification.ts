
import { Resolver } from 'node:dns/promises'
import Config from "@ioc:Adonis/Core/Config"
import Logger from '@ioc:Adonis/Core/Logger'

export default class Verification {
    public static async haveTxtRecord(host: string, txt: string) {
        const resolver = this.createResolver()
        /**
         * Resolve records example
         * [
         *    [ 'verification-code-site-App_feishu=wkfvRjBMoN6f9bQzsjJZ' ],
         *    [ 'v=spf1 +include:_netblocks.m.feishu.cn ~all' ]
         * ]
         */
        try {
            const records = await resolver.resolveTxt(host)
            return records.some(rows => rows.includes(txt))
        } catch (error) {
            Logger.error(error)
            return false
        }
    }

    static createResolver() {
        const {
            nameservers,
            tries,
            timeout
        } = Config.get('dns')
        const resolver = new Resolver({ tries, timeout })
        resolver.setServers(nameservers)
        return resolver
    }
}
