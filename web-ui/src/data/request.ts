import useLocaleStore from "@/locales/store"
import ky from 'ky'


const controller = new AbortController()

const locale = useLocaleStore.getState().locale

const endpointPrefix = '/api/v1'
const defaultTimeout = 60 * 1000
const api = ky.create({
    prefixUrl: endpointPrefix,
    signal: controller.signal,
    timeout: defaultTimeout,
    hooks: {
        beforeRequest: [
            request => request.headers.set('Accept-Language', locale),
            () => {
                // cancel previous request
                controller.abort()
            }
        ]
    }
})

const fetch = async (url: string): Promise<any> => {
    return api.get(url).json()
}

const post = async (url: string, data = {}): Promise<any> => {
    return api.post(url, {
        json: data,
    }).json()
}

export { fetch, post }
