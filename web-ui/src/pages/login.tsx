
import FormLogin from '@/components/FormLogin'
import useUserState from '@/data/use-user-state'
import DropdownLanguage from '@/components/DropdownLanguage'
import SwapDarkmode from "@/components/SwapDarkmode"
import { HeadProvider, Title } from "react-head"
import LateLogo from "/late.svg"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect } from 'react'

export function Component() {

    const { isLoggedIn, syncLoginState, login } = useUserState()
    const navigate = useNavigate()

    const { t } = useTranslation('translation', {
        keyPrefix: 'loginPage'
    })
    const { next } = useParams()
    const onLoggedIn = () => {
        navigate(next ?? '/')
    }

    useEffect(() => {
        syncLoginState().then(() => {
            if (isLoggedIn) {
                onLoggedIn()
            }
        })
    }, [])

    return (
        <>
            <HeadProvider>
                <Title>Late.ink</Title>
            </HeadProvider>
            <main className='h-full grid content-center'>
                <header className='text-left absolute right-0 top-0 mr-10 mt-6 w-56 flex items-center gap-5'>
                    <SwapDarkmode />
                    <DropdownLanguage />
                </header>
                <div className="flex flex-cols-4 gap-10">
                    <div className='grow'></div>
                    <div className='flex-initial w-96'>
                        <div className='text-left'>
                            <img src={LateLogo} className='inline-block w-60' alt="Late.ink" />
                        </div>
                        <div>
                            <ol className="text-base leading-relaxed mt-10 text-left">
                                <li>✅ {t('issue_by_web_panel')} </li>
                                <li>✅ {t('cert_renewal')} </li>
                                <li>✅ {t('cert_deployment')} </li>
                            </ol>
                        </div>
                    </div>
                    <div className='w-96 flex-initial'>
                        <FormLogin onSubmit={login} onLoggedIn={onLoggedIn} />
                        <hr className='mt-10' />
                        <div className='text-center p-5'>
                            <div className="tooltip" data-tip="how to reset password">
                                <a className="link">{t('form.forget_password')}</a>
                            </div>
                        </div>
                    </div>
                    <div className='grow'></div>
                </div>
            </main>
        </>
    )
}
