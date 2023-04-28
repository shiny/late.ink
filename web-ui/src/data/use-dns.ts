import { create } from "zustand"
import { ApiResponse, fetch, post } from "./request"

export interface InputConfig {
    name: string
    type: "text" | "password"
}

/**
 * @example
 * ```typescript
 * const credentialItem = {
 *      name: "My token",
 *      token: "***"
 * }
 * ```
 */
export type CredentialItem = Record<InputConfig["name"], string>

/**
 * @example
 * ```typescript
 * const credential = {
 *      Cloudflare: {
 *          name: "My token",
 *          token: "***"
 *      }
 * }
 * ```
 */
export type Credential = Record<Provider["name"], CredentialItem>

export interface Provider {
    id: number
    name: string
    /**
     * the credential apply link
     */
    link: string
    input_config: InputConfig[]
}


interface UseDns {
    providers: Provider[]
    providerId: number
    credentialId: number
    credentials: CredentialOption[]
    fetch: () => Promise<Provider[]>
    getProvider: () => undefined | Provider
    setProviderId: (providerId: number) => void
    test: (providerId: number, credential: CredentialItem) => Promise<TestCredentialResponse>
    createCredential: (providerId: number, form: Record<string, string>) => Promise<any>
    fetchCredentials: (providerId?: number) => Promise<CredentialOption[]>
    setCredentialId: (credentialId: number) => void
}

export interface TestCredentialResponse extends ApiResponse {
    success: boolean
}

interface CredentialOption {
    id: number
    dns_prodiver_id: number
    name: ''
    provider: {
        id: number
        name: string
    }
}

const useDns = create<UseDns>((set, get) => {
    return {
        providers: [],
        credentials: [],
        providerId: 0,
        credentialId: 0,
        fetch: async () => {
            const providers = await fetch<Provider[]>('dns/provider')
            set({ providers })
            if (providers.length > 0) {
                get().setProviderId(providers[0].id)
            }
            return providers
        },
        getProvider: () => {
            const { providerId, providers } = get()
            if (!providerId) {
                return
            } else {
                return providers.find(item => item.id === providerId)
            }
        },
        setProviderId: (providerId: number) => {
            set({
                providerId
            })
        },
        test: async (providerId: number, credential: CredentialItem): Promise<TestCredentialResponse> => {
            const { success, errors } = await post<TestCredentialResponse>(`dns/provider/${providerId}/test`, credential)
            return { success, errors }
        },
        createCredential: async (providerId: number, form: Record<string, string>) => {
            const credential = await post(`dns/provider/${providerId}/credential`, form, {
                throwHttpErrors: true
            })
            console.log(credential)
            return credential
        },
        fetchCredentials: async (providerId = 0) => {
            const credentials = await fetch<CredentialOption[]>(`dns/provider/${providerId}/credential`)
            set({ credentials })
            return credentials
        },
        setCredentialId: (credentialId: number) => {
            set({
                credentialId
            })
        }
    }
})

export default useDns
