import { create } from "zustand"
import { fetcher } from "./request"

interface Authority {
    id: number
    ca: string
    type: 'production' | 'staging'
}

interface Account {
    email: string
    authority_id: number
    id: number
}

interface UseAuthority {
    authorities: Authority[]
    accounts: Account[],
    initiated: boolean
    fetchFromServer: () => Promise<void>
    fetchAccounts: (authorityId: number) => Promise<void>
    clearAccounts: () => void
}

const useAuthority = create<UseAuthority>((set) => {
    return {
        authorities: [] as Authority[],
        accounts: [] as Account[],
        initiated: false,
        fetchFromServer: async () => {
            const authorities = await fetcher('/authority')
            if (Array.isArray(authorities)) {
                set({
                    initiated: true,
                    authorities
                })
            }
        },
        fetchAccounts: async (authorityId: number) => {
            const accounts = await fetcher(`/authority/${authorityId}/account`)
            if (Array.isArray(accounts)) {
                set({
                    accounts
                })
            }
        },
        clearAccounts: () => {
            set({
                accounts: []
            })
        }
    }
})

export default useAuthority
