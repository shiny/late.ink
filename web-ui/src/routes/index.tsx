
import {  Navigate, RouteObject } from "react-router-dom"

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
                Component: () => <Navigate to="/certificate" replace />
            },
            {
                path: '/certificate',
                lazy: () => import('@/pages/certificate/index')
            },
            {
                path: '/dns-verification',
                lazy: () => import('@/pages/dns-verification'),
            },
            {
                path: '/acme-account',
                lazy: () => import('@/pages/acme-account'),
            },
            {
                path: '/deployment',
                lazy: () => import('@/pages/deployment'),
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
                        path: 'dns-credential',
                        lazy: () => import('@/pages/certificate/create/dns-credential')
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
