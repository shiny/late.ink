
import {  RouteObject } from "react-router-dom"

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
                index: true,
                lazy: () => import('@/pages/index')
            },
            {
                path: '/certificate/create',
                lazy: () => import('@/pages/certificate/create/layout'),
                children: [
                    {
                        path: 'domain',
                        lazy: () => import('@/pages/certificate/create/domain'),
                    },
                    {
                        path: 'ca',
                        lazy: () => import('@/pages/certificate/create/ca')
                    },
                    {
                        path: 'dns',
                        lazy: () => import('@/pages/certificate/create/dns')
                    },
                    {
                        path: 'finish',
                        lazy: () => import('@/pages/certificate/create/finish')
                    },
                ]
            }
        ]
    }
]
