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
        ],
        beforeError: [
            async (error) => {
                const { response } = error
                const result = await response.json()
                if (Array.isArray(result) && result.length > 0) {
                    error.message = result[0].message
                    if (result[0].type) {
                        error.name = result[0].type
                    }
                }
                if ('errors' in result && result.errors?.[0].message) {
                    error.message = result.errors?.[0].message
                }
                return error
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
