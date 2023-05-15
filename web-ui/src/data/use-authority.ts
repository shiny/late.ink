import { create } from "zustand"
import { fetch, post } from "./request"
import type { Pagination, SuccessCheck } from "@late/Response"

export interface Authority {
    id: number
    ca: string
    type: 'production' | 'staging'
}

export interface Account {
    email: string
    authorityId: number
    id: number
    authority: Authority
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
    fetchAccounts: (authorityId?: number, page?: number) => Promise<Pagination<Account>>
    createAccount: (form: CreateAccountOptions) => Promise<any>
    clearAccounts: () => void
    selectAccountId: (accountId: number) => void
    selectDefaultAccountId: () => void
    selectAuthorityId: (authorityId: number) => Promise<void>
    test: (accountId: number) => Promise<SuccessCheck>
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
                const authorities = await fetch<Authority[]>('authority', {
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
        fetchAccounts: async (authorityId?: number, page?: number) => {
            if (!authorityId) authorityId = 0
            if (!page) page = 1
            set({ loadingAccount: true })
            try {
                const response = await fetch<Pagination<Account>>(`authority/${authorityId}/account`, {
                    searchParams: { page },
                    throwHttpErrors: true
                })
                const accounts = response.data
                set({
                    accounts
                })
                // set the first account as default (if any)
                if (!get().accountId && accounts.length > 0 && accounts[0].id) {
                    get().selectAccountId(accounts[0].id)
                }
                return response
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
                const account = await post<Account>(`authority/${authorityId}/account`, {
                    email
                }, {
                    throwHttpErrors: true
                })
                set({
                    accounts: [...accounts, account],
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
            const account = get().accounts.find(item => item.id === accountId)
            set({
                accountId: accountId,
            })
            if (account) {
                set({
                    authorityId: account.authorityId
                })
            }
        },
        test: async (accountId: number): Promise<SuccessCheck> => {
            return post<SuccessCheck>(`authority/0/account/${accountId}/test`)
        }
    }
})

export default useAuthority
