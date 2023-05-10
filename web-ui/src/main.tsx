import React from 'react'
import ReactDOM from 'react-dom/client'
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom"
import  "@/locales"
import './main.css'
import 'react-tooltip/dist/react-tooltip.css'
import { routes } from "./routes/index"
import useLocaleStore from '@/locales/store'

useLocaleStore.getState().init()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <RouterProvider router={createBrowserRouter(routes)}></RouterProvider>
    </React.StrictMode>,
)
