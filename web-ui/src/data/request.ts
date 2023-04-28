import useLocaleStore from "@/locales/store"
import ky, { Options } from 'ky'

export interface ErrorMessage {
    message: string
}

export interface ApiResponse {
    errors?: ErrorMessage[]
}

const controller = new AbortController()

const endpointPrefix = '/api/v1'
const defaultTimeout = 60 * 1000
const api = ky.create({
    prefixUrl: endpointPrefix,
    signal: controller.signal,
    timeout: defaultTimeout,
    retry: 1,
    throwHttpErrors: false,
    hooks: {
        beforeRequest: [
            request => {
                const locale = useLocaleStore.getState().locale
                request.headers.set('Accept-Language', locale)
            }
        ]
    }
})

const fetch = async<T>(url: string, options?: Options) => {
    return api.get(url, options).json<T>()
}

const post = async<T>(url: string, data = {}, options?: Options) => {
    return api.post(url, {
        json: data,
        ...options,
    }).json<T>()
}

export { fetch, post }
