import { create } from "zustand"

import { ApiCheckResponse, fetch, post } from "./request"
import { Pagination } from "@late/Response"

interface UsePlugin {
    plugins: Plugin[]
    refresh: (type: string, page: number) => Promise<Pagination<Plugin>>
    createDeployment: (options: createDeploymentOptions) => Promise<void>
    validate: (pluginId: number, pluginConfig: any) => Promise<ApiCheckResponse>
}

interface createDeploymentOptions {
    certId: number
    pluginId: number
    pluginConfig: any
    immediate: boolean
}

export interface Plugin {
    id: number
    packageName: string
    version: string
    pluginCategory: string
    installFrom: string
    url: string
    inputConfig: InputConfig[]
    locales: Record<string, Record<string, any>>
    icon: string
    status: string
}

export interface InputConfig {
    name: string
    type?: 'text' | 'divider'
    default?: string | number
    rows?: number
    className?: string
}

const usePlugin = create<UsePlugin>((set) => {
    return {
        plugins: [],
        refresh: async (type: string, page = 1) => {
            const response = await fetch<Pagination<Plugin>>('plugin', {
                searchParams: { page, type }
            })
            set({
                plugins: response.data
            })
            return response
        },
        createDeployment: async ({ certId, pluginId, pluginConfig, immediate }: createDeploymentOptions) => {
            await post('deployment', {
                certId,
                pluginConfig,
                name: pluginConfig.name,
                pluginId,
                immediate
            })
        },
        validate: async (pluginId: number, pluginConfig: any) => {
            const response = await post<ApiCheckResponse>('deployment/validate', {
                pluginConfig,
                name: pluginConfig.name,
                pluginId
            })
            return response
        }
    }
})
export default usePlugin
