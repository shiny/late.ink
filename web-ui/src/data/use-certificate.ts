import { create } from "zustand"
import { fetch } from './request'
import type { Pagination } from "@late/Response"

export interface Certificate {
    id: number
    domains: string[]
    expiredAt: string
    algorithm: string
    orderId: number
    createdAt: string
    updatedAt: string

    order: {
        dnsProviderCredential: {
            provider: {
                id: number
                name: string
                link: string
            }
        }
        authority: {
            id: number
            ca: string
        }
    }
}

interface UseCertificate {
    certificates: Certificate[]
    refresh: (page?: number) => Promise<Pagination<Certificate>>
}

const useCertificate = create<UseCertificate>((set) => {
    return {
        certificates: [],
        refresh: async (page = 1) => {
            const response = await fetch<Pagination<Certificate>>('certificate', {
                searchParams: { page }
            })
            set({
                certificates: response.data
            })
            return response
        }
    }
})

export default useCertificate
