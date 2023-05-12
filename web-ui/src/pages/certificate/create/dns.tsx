import { IconInfo, IconLoading } from "@/assets/Icons"
import useDns from "@/data/use-dns"
import { useDataFromAction, useDataFromLoader } from "@/utils/router"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Form, Link, redirect, useNavigation } from "react-router-dom"
import useOrder from '@/data/use-order'
import { useDomains } from '@/data/use-form'
import useAuthority from "@/data/use-authority"
import { HeadProvider, Title } from "react-head"

export async function loader() {
    const { fetchCredentials } = useDns.getState()
    return (await fetchCredentials()).data
}

export async function action({ request }: { request: Request }) {
    const form = Object.fromEntries(await request.formData()) as any

    const { authorityId, accountId } = useAuthority.getState()

    if (!authorityId) {
        return
    }
    
    const { domains } = useDomains.getState()
    const dnsProviderCredentialId = parseInt(form['credentialId'])
    
    try {
        const { create, setOrder } = await useOrder.getState()
        const order = await create({
            domains,
            dnsProviderCredentialId,
            authorityId,
            accountId
        })
        setOrder(order)
        return redirect('/certificate/create/finish')
    } catch (err: any) {
        return err.message
    }
}

export function Component() {
    const credentialOptions = useDataFromLoader(loader)
    const { providerId, credentialId, setCredentialId } = useDns()
    useEffect(() => {
        if (!providerId && credentialOptions.length > 0) {
            setCredentialId(credentialOptions[0].id)
        }
    }, [ providerId, credentialOptions])
    const { t } = useTranslation('translation')

    const currentCredentialOption = credentialOptions.find(item => item.id === credentialId)

    const navigation = useNavigation()
    const isSubmitting = navigation.state === 'submitting'
    const errorMessage = useDataFromAction(action)

    return <Form method="POST">
        <HeadProvider>
            <Title>{t('certificate.DNS_Verification')}</Title>
        </HeadProvider>
        <h2 className="text-2xl font-semibold leading-7 text-gray-900">
            {t('certificate.DNS_Verification')}
            <div className="tooltip" data-tip="Subjective Alternative Name">
                <IconInfo className="w-6 h-6" />
            </div>
        </h2>
        <div className="divider" />
        <label htmlFor="account" className="block text-lg font-semibold leading-6 text-gray-900">
            {t('certificate.select_DNS_API_Credential')}
        </label>
        <select
            id="account"
            value={credentialId}
            name="credentialId"
            className="select select-bordered text-xl w-full max-w-xs mt-2"
            onChange={e => setCredentialId(parseInt(e.currentTarget.value))}>
            {credentialOptions.map(item => <option key={`dns-credential-${item.id}`} value={item.id}>
               [{item.provider.name}] {item.name}
            </option>)}
        </select> <Link className="ml-4 link" to={'../dns-credential'}>Create new DNS API Credential</Link>
        {/* {errorMessage && <div className="mt-4 alert alert-error shadow-lg">{errorMessage}</div>} */}
        {currentCredentialOption && <div className="p-4 bg-neutral-100 mt-4 rounded">
            <IconInfo className="w-6 h-6 inline-block align-text-top" /> {t('certificate.dns_provider_tips', {
                name: currentCredentialOption.provider.name
            })}
        </div>}
        {errorMessage && <div className="mt-4 alert alert-error shadow-lg">
            <div>
                <IconInfo className="w-6 h-6 flex-shrink-0 align-text-top" /> {errorMessage}
            </div>
        </div>}
        <div className="mt-4">
            {!isSubmitting && <button type="submit" className="btn btn-primary btn-lg">{t('certificate.next')}</button>}
            {isSubmitting && <button disabled={true} className="btn btn-primary btn-lg">
                <IconLoading /> {t('certificate.next')}</button>}
        </div>
    </Form>
}
