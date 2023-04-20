import { IconInfo, IconLoading } from "@/assets/Icons"
import useAuthority from "@/data/use-authority"
import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

export default function SelectCaAccount() {
    const { authorities, initiated, fetchFromServer, accounts, fetchAccounts } = useAuthority()
    const findAuthority = (authorityId: number) => authorities.find(item => item.id === authorityId)
    const { t } = useTranslation('translation', { keyPrefix: "certificate" })
    const [ authorityId, selectAuthorityId ] = useState<number|undefined>()
    useEffect(() => {
        fetchFromServer()
    }, [])

    const authority = useMemo(() => {
        if (authorityId) {
            return findAuthority(authorityId)
        }
    }, [
        authorityId, authorities
    ])

    useEffect(() => {
        if (authorityId) {
            fetchAccounts(authorityId)
        }
    }, [ authorityId ])

    return <div>
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
                {!initiated && <IconLoading />}
                {authorities.map(item => <label key={`ca-${item.id}`} className="label">
                    <input
                        type="radio"
                        onChange={e => selectAuthorityId(parseInt(e.target.value))}
                        value={item.id}
                        name="authority_id"
                        className="radio inline-block checked:bg-[--primary-color]"
                    />
                    <span className="label-text text-2xl inline-block pl-2">{item.ca}</span>
                </label>)}
            </div>
        </div>
        {!!authority && <div className="mt-4">
            <label htmlFor="account" className="block text-lg font-semibold leading-6 text-gray-900">
                {t('select_account', { name: authority?.ca || ''})}
            </label>
            <select id="account" className="select select-bordered text-xl w-full max-w-xs mt-2">
                {accounts.map(account => <option key={`account-${account.id}`} value={account.id}>
                    {account.email}
                </option>)}
            </select>
            <div className="divider">{t('create_account', {
                    name: authority.ca
                })}</div>
            <div>
                <input type="email" placeholder="E-Mail" className="input input-bordered w-full max-w-xs" />
                <button className="btn">{t('submit_account_creation')}</button>
            </div>
        </div>}
        
        <div className="mt-6">
            <button className="btn btn-primary btn-lg">{t('next')}</button>
        </div>
    </div>
}
