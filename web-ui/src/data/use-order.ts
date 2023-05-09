import { create } from 'zustand'
import { post, fetch } from './request'

interface OrderForm {
    domains: string[]
    authorityId: number
    dnsProviderCredentialId: number
    accountId: number
}

interface Certificate {
    id: number
    expiredAt: string
    algorithm: string
}

interface Order {
    id: number
    domains: string[]
    status: string
    expiredAt: string
    authorizations: Authorization[]
    certificate?: Certificate
}

interface Authorization {
    id: number
    status: string
    isWildcard: boolean
    identifierType: string
    identifierValue: string
    expiredAt: string
    challenges: Challenge[]
}

interface Challenge {
    id: number
    type: string
    status: string
}

interface useOrder {
    processStatus: string
    order?: Order
    create: (form: OrderForm) => Promise<Order>
    setOrder: (order: Order) => void
    refreshOrder: (authorityId: number, orderId: number) => Promise<void>
    process: (authorityId: number, orderId: number) => Promise<boolean>
    shouldRefresh: (status: string) => boolean
}

export interface ProcessResult {
    order: string
    id: number,
    authorityId: number,
    authorizations: string[]
}

const useOrder = create<useOrder>((set, get) => {
    return {
        processStatus: '',
        create: async (form: OrderForm) => {
            const res = await post<Order>(`authority/${form.authorityId}/order`, {
                ...form
            }, {
                throwHttpErrors: true
            })
            return res
        },
        setOrder: (order: Order) => {
            set({
                order
            })
        },
        shouldRefresh: (status: string) => {
            if (status.endsWith('error')) {
                return false
            }
            if (status === 'valid:completed') {
                return false
            }
            if (status === 'valid') {
                return false
            }
            if (status === 'ignore') {
                return false
            }
            return true
        },
        refreshOrder: async (authorityId: number, orderId: number) => {
            const order = await fetch<Order>(`authority/${authorityId}/order/${orderId}`, {
                throwHttpErrors: true
            })
            set({ order })
        },
        process: async (authorityId: number, orderId: number) => {
            const processResult = await fetch<ProcessResult>(`authority/${authorityId}/order/${orderId}/processing`, {
                throwHttpErrors: true
            })
            if (processResult.order !== 'ignore') {
                set({
                    processStatus: processResult.order
                })
            }
            const shouldRefresh = get().shouldRefresh(processResult.order)
            //if (!shouldRefresh && Array.isArray(processResult.authorizations)) {
            //    shouldRefresh = processResult.authorizations.some(status => get().shouldRefresh(status))
            //}
            if (shouldRefresh) {
                await get().refreshOrder(authorityId, orderId)
            }
            return shouldRefresh
        }
    }
})

export default useOrder
