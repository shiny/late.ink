import DropdownLanguage from '@/components/DropdownLanguage'
import Sidebar from '@/components/Sidebar'
import SwapDarkmode from '@/components/SwapDarkmode'
import useUserState from '@/data/use-user-state'
import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

/**
 * Dashborad Layout File
 * @returns 
 */
export default function Dashboard() {
    const { isLoggedIn, loginPage, syncLoginState } = useUserState()
    const navigate = useNavigate()
    if (!isLoggedIn) {
        navigate(loginPage)
    }
    console.log(isLoggedIn)
    useEffect(() => {
        syncLoginState()
    }, [])

    return <div>
        <div className="drawer drawer-mobile bg-base-200">
            <input id="my-drawer" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content">
                <main>
                    <header className='text-left absolute right-0 top-0 mr-10 mt-6 w-56 flex items-center gap-5'>
                        <SwapDarkmode />
                        <DropdownLanguage />
                    </header>
                    <Outlet />
                </main>
            </div>
            <Sidebar />
        </div>
    </div>
}
