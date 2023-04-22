
import { redirect, RouteObject } from "react-router-dom"
import { lazy } from "@/utils/router"

export const routes: RouteObject[] = [
    {
        path: '/login',
        lazy: () => import('@/pages/login')
    },
    {
        path: '/logout',
        lazy: () => import('@/pages/logout')
    },
    {
        path: '/',
        lazy: () => import('@/layouts/Dashboard'),
        children: [
            {
                path: '',
                lazy: () => import('@/pages/index')
            },
            {
                path: '/certificate/create',
                lazy: () => import('@/pages/certificate/create')
            }
        ]
    }
]
