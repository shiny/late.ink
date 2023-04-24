import { create } from "zustand"
import { fetch, post } from "./request"

export interface Authority {
    id: number
    ca: string
    type: 'production' | 'staging'
}

export interface Account {
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
    accounts: Account[]
    accountId: number
    authorityId?: number
    initiated: boolean
    loadingAuthority: boolean
    loadingAccount: boolean
    submittingAccount: boolean
    newEmail: string
    setNewEmail: (email: UseAuthority["newEmail"]) => void
    fetchAuthorities: () => Promise<Authority[]>
    getAuthority: () => Authority | undefined
    fetchAccounts: (authorityId: number) => Promise<void>
    createAccount: (form: CreateAccountOptions) => Promise<any>
    clearAccounts: () => void
    selectAccountId: (accountId: number) => void
    selectDefaultAccountId: () => void
    selectAuthorityId: (authorityId: number) => Promise<void>
}

/**
 * load Authoriy and the accounts
 */
const useAuthority = create<UseAuthority>((set, get) => {
    return {
        authorities: [] as Authority[],
        accounts: [] as Account[],
        initiated: false,
        accountId: 0,
        authorityId: 0,
        loadingAuthority: false,
        loadingAccount: false,
        submittingAccount: false,
        newEmail: '',
        setNewEmail: (email: string) => set({ newEmail: email }),
        getAuthority: () => {
            return get().authorities.find(item => item.id === get().authorityId)
        },
        fetchAuthorities: async () => {
            set({ loadingAuthority: true })
            try {
                const authorities = await fetch('authority', {
                    throwHttpErrors: true
                })
                set({
                    authorities,
                })
                return authorities
            } catch (e) {
                throw e
            } finally {
                set({
                    loadingAuthority: false
                })
            }
        },
        /**
         * select authority and load accounts
         * @param authorityId 
         */
        selectAuthorityId: async (newAuthorityId: number) => {
            const { authorityId, clearAccounts, fetchAccounts } = get()
            if (authorityId !== newAuthorityId) {
                clearAccounts()
                set({
                    authorityId: newAuthorityId
                })
                await fetchAccounts(newAuthorityId)
            }
        },
        fetchAccounts: async (authorityId: number) => {
            set({ loadingAccount: true })
            try {
                const accounts = await fetch(`authority/${authorityId}/account`, {
                    throwHttpErrors: true
                })
                set({
                    accounts
                })
                // set the first account as default (if any)
                if (!get().accountId && accounts.length > 0 && accounts[0].id) {
                    get().selectAccountId(accounts[0].id)
                }
            } catch (e) {
                throw e
            } finally {
                set({
                    loadingAccount: false,
                })
            }
        },
        createAccount: async ({ authorityId, email }: CreateAccountOptions) => {
            const accounts = get().accounts
            set({
                submittingAccount: true
            })
            try {
                const account = await post(`authority/${authorityId}/account`, {
                    email
                }, {
                    throwHttpErrors: true
                })
                set({
                    accounts: [ ...accounts, account ],
                    accountId: account.id,
                })
                return account
            } catch (e) {
                throw e
            } finally {
                set({
                    submittingAccount: false
                })
            }
        },
        clearAccounts: () => {
            set({
                accounts: [],
                accountId: 0
            })
        },
        selectDefaultAccountId: () => {
            const id = get().accounts?.[0].id
            if (typeof id !== 'undefined') {
                get().selectAccountId(id)
            }
        },
        selectAccountId: (accountId: number) => {
            set({
                accountId: accountId
            })
        },
    }
})

export default useAuthority
