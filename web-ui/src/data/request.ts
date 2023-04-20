import useLocaleStore from "@/locales/store"
import ky from 'ky'
const locale = useLocaleStore.getState().locale

const endpointPrefix = '/api/v1'

const fetcher = async (url: string): Promise<any> => {
    return ky.get(endpointPrefix + url, {
        headers: {
            "Accept-Language": locale,
        }
    }).json()
}

const poster = async (url: string, data = {}): Promise<any> => {
    return ky.post(endpointPrefix + url, {
        headers: {
            "Accept-Language": locale,
        },
        json: data
    }).json()
}

export { fetcher, poster }
