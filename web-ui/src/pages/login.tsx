
import FormLogin from '@/components/FormLogin'
import useUserState, { User } from '@/data/use-user-state'
import DropdownLanguage from '@/components/DropdownLanguage'
import SwapDarkmode from "@/components/SwapDarkmode"
import { HeadProvider, Title } from "react-head"
import LateLogo from "/late.svg"
import { useTranslation } from "react-i18next"
import { redirect } from 'react-router-dom'
import { useDataFromAction, useDataFromLoader } from '@/utils/router'

function getNextUrl(request: Request) {
    const next = new URL(request.url).searchParams.get('next') || '/'
    return next
}

/**
 * Check is user loggedIn or not
 * @param param0 
 * @returns 
 */
export async function loader({ request }: { request: Request }) {
    const { syncLoginState } = useUserState.getState()
    const next = getNextUrl(request)
    const isLoggedIn = await syncLoginState()
    if (isLoggedIn) {
        return redirect(next)
    } else {
        return false
    }
}

/**
 * Post user login form
 * @param param0 
 * @returns 
 */
export async function action({ request }: { request: Request }) {
    const form = await request.formData()
    const user = Object.fromEntries(form) as unknown
    const login = useUserState.getState().login
    const { errors, success } = await login(user as User)
    console.log(errors)
    if (success) {
        const next = getNextUrl(request)
        return redirect(next)
    } else {
        return errors
    }
}

export function Component() {

    useDataFromLoader(loader)
    const errors = useDataFromAction(action)
    const { t } = useTranslation('translation', {
        keyPrefix: 'loginPage'
    })

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
                        <FormLogin>
                            {Array.isArray(errors) && <FormLogin.ErrorInfo errors={errors} />}
                        </FormLogin>
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
