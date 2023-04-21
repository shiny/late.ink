import { create } from "zustand"
import { fetch, post } from "./request"

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

interface CreateAccountOptions {
    authorityId: number
    email: string
}

interface UseAuthority {
    authorities: Authority[]
    accounts: Account[],
    initiated: boolean
    fetchFromServer: () => Promise<void>
    fetchAccounts: (authorityId: number) => Promise<void>
    createAccount: (form: CreateAccountOptions) => Promise<any>
    clearAccounts: () => void
}

const useAuthority = create<UseAuthority>((set) => {
    return {
        authorities: [] as Authority[],
        accounts: [] as Account[],
        initiated: false,
        fetchFromServer: async () => {
            const authorities = await fetch('authority')
            if (Array.isArray(authorities)) {
                set({
                    initiated: true,
                    authorities
                })
            }
        },
        fetchAccounts: async (authorityId: number) => {
            const accounts = await fetch(`authority/${authorityId}/account`)
            if (Array.isArray(accounts)) {
                set({
                    accounts
                })
            }
        },
        createAccount: async ({ authorityId, email }: CreateAccountOptions) => {
            const account = await post(`authority/${authorityId}/account`, {
                email
            })
            return account
        },
        clearAccounts: () => {
            set({
                accounts: []
            })
        }
    }
})

export default useAuthority
