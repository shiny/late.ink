
import { Options } from "got"
import { HttpsProxyAgent } from "hpagent"
import Config from "@ioc:Adonis/Core/Config"
import { Ca } from "handyacme"
import type { AvailableEnvironment } from "App/Models/Authority"

/**
 * decorator autoProxy
 * proxy for got fetch
 * add `agent` in options automatically
 * @example
 * add decorator &#064;autoProxy for the method:
 * 
 * ```
 *  async fetch<T>(url: string | URL, options?: Options): Promise<Response<T>> {
 *      return got(url, got.mergeOptions({
 *          throwHttpErrors: false,
 *          responseType: 'json',
 *          http2: true
 *      }, options ?? {})) as Promise<Response<T>>
 *  }
 * ```
 * @param _target 
 * @param _key 
 * @param descriptor 
 */
export default function autoProxy(_target: Object, _key: string, descriptor: PropertyDescriptor)  {
    const fetch = descriptor.value
    descriptor.value = function(url: string | URL, options?: Options) {
        const optinsWithProxy = options || {}
        optinsWithProxy.http2 = false
        optinsWithProxy.agent = {
            https: new HttpsProxyAgent({
                keepAlive: true,
                keepAliveMsecs: 1000,
                maxSockets: 256,
                maxFreeSockets: 256,
                scheduling: 'lifo',
                proxy: Config.get('proxy.httpsProxy')
            }),
        }
        return fetch.apply(this, [ url, optinsWithProxy ]);
    }
}

export async function autoProxyDirectory(target: Ca, type: AvailableEnvironment) {
    target.request.agent = new HttpsProxyAgent({
        keepAlive: true,
        keepAliveMsecs: 1000,
        maxSockets: 256,
        maxFreeSockets: 256,
        scheduling: 'lifo',
        proxy: Config.get('proxy.httpsProxy')
    })
    switch (type) {
        case "production":
                return await target.setDirectory(target.productionDirectoryUrl)
            break
        case "staging":
                return await target.setDirectory(target.productionDirectoryUrl)
            break
    }
}
