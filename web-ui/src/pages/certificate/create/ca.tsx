import { IconInfo, IconLoading } from "@/assets/Icons"
import Loading from "@/components/Loading"
import useAuthority, { Authority } from "@/data/use-authority"
import { useDataFromLoader } from "@/utils/router"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Form, redirect, useNavigation } from "react-router-dom"
import { HeadProvider, Title } from "react-head"

export async function loader(): Promise<{ authorities: Authority[] }> {
    const authorities = await useAuthority.getState().fetchAuthorities()
    if (authorities?.[0].id) {
        await useAuthority.getState().selectAuthorityId(authorities?.[0].id)
    }
    return { authorities }
}

export async function action({ request }: { request: Request }) {
    const form = Object.fromEntries(await request.formData() as any) as {
        authorityId: number
        accountId?: number
        email?: string
    }
    if (form.email && !form.accountId) {
        const createAccount = useAuthority.getState().createAccount
        await createAccount({
            authorityId: form.authorityId,
            email: form.email
        })
    }
    // const createAccount = useAuthority.getState().createAccount
    // createAccount({ authorityId, email })
    return redirect('/certificate/create/dns')
}

export function Component() {
    const {
        authorities
    } = useDataFromLoader(loader)
    const {
        accountId,
        authorityId,
        selectAuthorityId,
        getAuthority,
        loadingAccount,
        newEmail
    } = useAuthority()
    const authority = getAuthority()
    const { t } = useTranslation('translation', { keyPrefix: "certificate" })

    const isFormReady = () => accountId || newEmail.includes('@')
    const { state } = useNavigation()
    const submitting = state === 'submitting'

    return <Form method="post">
        <HeadProvider>
            <Title>{t('choose_ca_account')}</Title>
        </HeadProvider>
        <div>
            <h2 className="text-2xl font-semibold leading-7 text-gray-900">{t('authority_account')}
                <div className="tooltip" data-tip="Production mode">
                    <IconInfo className="w-6 h-6" />
                </div>
            </h2>
        </div>
        <div className="divider" />
        <div className="mt-4">
            <label className="block text-lg font-semibold leading-6 text-gray-900">
                {t('cert_authority')}
            </label>
            <div className="flex gap-10 mt-2">
                {authorities.map(item => <label key={`ca-${item.id}`} className="label">
                    <input
                        type="radio"
                        checked={authorityId === item.id}
                        onChange={e => selectAuthorityId(parseInt(e.target.value))}
                        value={item.id}
                        name="authorityId"
                        className="radio inline-block checked:bg-[--primary-color]"
                    />
                    <span className="label-text text-2xl inline-block pl-2">{item.ca}</span>
                </label>)}
            </div>
        </div>
        {!!authority && <div className="mt-4 min-h-[60px]">
            <Loading loading={loadingAccount}>
                <SelectAccount />
            </Loading>
        </div>}

        <div className="mt-6">
            <button
                type="submit"
                disabled={!isFormReady() || submitting}
                className="btn btn-primary btn-lg">
                {submitting && <>
                    <IconLoading className="mr-3 w-4 h-4" /> Submitting
                </>}
                {!submitting && t('next')}
            </button>
        </div>
    </Form>
}

function SelectAccount() {
    const { t } = useTranslation('translation', { keyPrefix: "certificate" })
    const {
        accountId,
        accounts,
        selectAccountId,
        getAuthority,
        selectDefaultAccountId
    } = useAuthority()
    const [isCreate, setCreate] = useState(accounts.length === 0)
    const authority = getAuthority()

    if (!authority) {
        return <></>
    }
    const onCreate = () => {
        selectAccountId(0)
        setCreate(true)
    }
    const name = authority?.ca || ''
    if (isCreate) {
        return <CreateAccount onCancel={() => {
            if (accounts.length > 0) {
                selectDefaultAccountId()
                setCreate(false)
            }
        }} />
    } else {
        return <>
            <label htmlFor="account" className="block text-lg font-semibold leading-6 text-gray-900">
                {t('select_account', { name })}
            </label>
            <select id="account"
                name="accountId"
                value={accountId}
                onChange={e => selectAccountId(parseInt(e.target.value))}
                className="select select-bordered text-xl w-full max-w-xs mt-2">
                {accounts.map(account => <option key={`account-${account.id}`} value={account.id}>
                    {account.email}
                </option>)}
            </select>
            <span onClick={onCreate} className="link ml-3">{t('or_create_new_account', { name })}</span>
        </>
    }
}

function CreateAccount({ onCancel }: { onCancel?: () => void }) {
    const {
        getAuthority,
        accounts,
        newEmail,
        setNewEmail,
        submittingAccount
    } = useAuthority()

    const authority = getAuthority()

    const { t } = useTranslation('translation')

    if (!authority) {
        return <></>
    }
    return <>
        <label htmlFor="email" className="mt-4 block text-lg font-semibold leading-6 text-gray-900">
            {t('certificate.create_account', {
                name: authority.ca
            })}
        </label>
        <div className="mt-2">
            <input
                id="email"
                type="email"
                name="email"
                disabled={submittingAccount}
                onInput={({ currentTarget }) => setNewEmail(currentTarget.value)}
                placeholder={t('certificate.authority_account_email') ?? ''}
                className="input input-bordered w-full max-w-xs"
                value={newEmail}
            />
            {accounts.length > 0 && !submittingAccount && <span
                onClick={onCancel}
                className="link ml-3"
            >
                {t('cancel')}
            </span>}
        </div>
    </>
}
