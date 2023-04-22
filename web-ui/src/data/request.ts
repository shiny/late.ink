import useLocaleStore from "@/locales/store"
import ky, { Options } from 'ky'


const controller = new AbortController()

let isRequesting = false
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
        afterResponse: [
            () => {
                isRequesting = false
            }
        ]
    }
})

function startRequesting() {
    // only one request at a time
    if (isRequesting)
        controller.abort()
    else 
        isRequesting = true
}

const fetch = async (url: string, options?: Options): Promise<any> => {
    startRequesting()
    return api.get(url, options).json()
}

const post = async (url: string, data = {}, options?: Options): Promise<any> => {
    startRequesting()
    return api.post(url, {
        json: data,
        ...options,
    }).json()
}

export { fetch, post }
