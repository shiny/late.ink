import DropdownLanguage from '@/components/DropdownLanguage'
import Sidebar from '@/components/Sidebar'
import SwapDarkmode from '@/components/SwapDarkmode'
import { Outlet, redirect, useNavigation } from 'react-router-dom'
import { useDataFromLoader } from '@/utils/router'
import Breadcrumbs from '@/components/Breadcrumbs'
import { useEffect } from 'react'
import NProgress from "nprogress"
import 'nprogress/nprogress.css'

export async function loader({ request }: { request: Request }) {
    const useUserState = (await import('@/data/use-user-state')).default
    const { syncLoginState, loginPage } = useUserState.getState()
    const isLoggedIn = await syncLoginState()
    if (!isLoggedIn) {
        return redirect(loginPage + `?next=` + encodeURIComponent(request.url))
    } else {
        return {
            isLoggedIn
        }
    }
}

/**
 * Dashborad Layout File
 * @returns 
 */
export function Component() {
    useDataFromLoader(loader)

    const navigation = useNavigation()
    const isLoading = navigation.state === 'loading'

    useEffect(() => {
        if (isLoading) {
            NProgress.start()
        } else {
            NProgress.done()
        }
    }, [ isLoading ])

    return <div>
        <div className="drawer drawer-mobile bg-base-200">
            <input id="my-drawer" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content">
                <main>
                    <header className='text-left absolute right-0 top-0 mr-10 mt-6 w-56 flex items-center gap-5'>
                        <SwapDarkmode />
                        <DropdownLanguage />
                    </header>
                    <div className='mx-10 mt-5 mb-2'>
                        <Breadcrumbs/>
                    </div>
                    <Outlet />
                </main>
            </div>
            <Sidebar />
        </div>
    </div>
}


export const handle = {
    crumb: {
        title: 'home',
        to: '/'
    }
}
