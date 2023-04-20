
import type { RouteObject } from "react-router-dom"

// import Login from "@/pages/login"
import Layout from "@/layouts/Dashboard"
import { lazy, Suspense } from "react"

const Login = lazy(() => import('@/pages/login'))
const Dashboard = lazy(() => import('@/pages/index'))
const Create = lazy(() => import('@/pages/certificate/create'))

export const routes: RouteObject[] = [
    {
        path: '/login',
        element: <Suspense>
            <Login />
        </Suspense>,
    },
    {
        path: '/',
        element: <Layout />,
        children: [
            {
                path: '',
                element: <Suspense><Dashboard /></Suspense>
            },
            {
                path: '/certificate/create',
                element: <Suspense><Create /></Suspense> 
            }
        ]
    }
]
