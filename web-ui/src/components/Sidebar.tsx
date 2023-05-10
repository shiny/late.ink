
import { IconCert, IconDnsVerification, IconAcmeAccount, IconDeployment } from '@/assets/Icons'
import { Link, useLocation } from 'react-router-dom'
import LateLogo from "/late.svg"
import { useTranslation } from 'react-i18next'
import useUserState from '@/data/use-user-state'

export default function Sidebar() {
    const { t } = useTranslation()
    const name = useUserState(state => state.name)
    const location = useLocation()

    const menus = [
        {
            href: '/',
            title: t('nav.cert'),
            icon: IconCert
        },
        {
            href: '/dns-verification/',
            title: t('nav.DNS_verfication'),
            icon: IconDnsVerification
        },
        {
            href: '/ACME-account/',
            title: t('nav.ACME_account'),
            icon: IconAcmeAccount
        },
        {
            href: '/deployment/',
            title: t('nav.deployment'),
            icon: IconDeployment
        }
    ]

    return <div className="drawer-side py-6 px-12 pr-14 bg-base-100">
        <label htmlFor="my-drawer-2" className="drawer-overlay"></label>
        <div className='flex flex-col'>
            <Link className='flex-none pt-8 px-2 block text-center' to="/">
                <img src={LateLogo} className="w-40" />
            </Link>
            <ul className="grow menu mt-12 text-base-content">
                {menus.map((menu, index) => {
                    const isActive = location.pathname.startsWith(menu.href)
                    return <li className={isActive ? 'active' : ''} key={`nav-${index}`}>
                        <Link className='gap-2 active:text-[#371b45]' to={menu.href}>
                            <menu.icon className='w-6' />
                            {menu.title}
                        </Link>
                    </li>
                })}
            </ul>
            <div className='grow-0'>
                <ul className="menu text-base-content">
                    <li><a>Docs</a></li>
                    <li><Link to={`/logout?next=${encodeURIComponent(location.pathname)}`}>{t('nav.logout')}</Link></li>
                </ul>
            </div>
            <div className="grow-0 divider w-32" />
            <div className='grow-0'>
                <ul className="menu text-base-content">
                    <li><a>{name}</a></li>
                </ul>
            </div>
        </div>
    </div>
}
