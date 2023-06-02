import { create } from "zustand"
import { fetch, post } from './request'
import type { Pagination } from "@late/Response"
import { Certificate } from "./use-certificate"
import { Plugin } from "./use-plugin"

enum JobStatus {
    Available,
    Pending,
    Running,
    Accomplished,
    Unavailable,
    Disabled,
    Error,
}

export interface Job {
    id: number
    interval: number | null
    lastRunAt: string | null
    lastRunStatus: keyof typeof JobStatus | null
    lastRunMessage: string | null
    nextRunAt: string | null
    status: keyof typeof JobStatus
}

export interface Deployment {
    id: number
    name: string
    pluginId: number
    certificates: Certificate[]
    jobs: Job[],
    plugin: Omit<Plugin, 'inputConfig'>
    createdAt: string
    updatedAt: string
}

interface UseDeployment {
    deployments: Deployment[]
    refresh: (page?: number) => Promise<Pagination<Deployment>>
    trigger: (id: number) => Promise<void>
}

const useDeployment = create<UseDeployment>((set) => {
    return {
        deployments: [],
        refresh: async (page = 1) => {
            const response = await fetch<Pagination<Deployment>>('deployment', {
                searchParams: { page }
            })
            set({
                deployments: response.data
            })
            return response
        },
        trigger: async (id: number) => {
            const response = await post(`deployment/${id}/trigger`)
        }
    }
})

export default useDeployment
