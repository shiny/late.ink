import { create } from "zustand"
import { fetch } from './request'

interface PaginatedResponse {
    meta: {
        total: number,
        per_page: number,
        current_page: number,
        last_page: number,
        first_page: number,
    },
    data: Certificate[]
}

interface Certificate {
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
    refresh: (page?: number) => Promise<PaginatedResponse>
}

const useCertificate = create<UseCertificate>((set) => {
    return {
        certificates: [],
        refresh: async (page = 1) => {
            const response = await fetch<PaginatedResponse>('certificate', {
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
