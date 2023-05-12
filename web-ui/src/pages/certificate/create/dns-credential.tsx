import { IconChecked, IconInfo, IconLoading } from "@/assets/Icons"
import type { InputConfig, Credential, CredentialItem, TestCredentialResponse, Provider } from "@/data/use-dns"
import useDns from "@/data/use-dns"
import { useDataFromAction, useDataFromLoader } from "@/utils/router"
import { FormEventHandler, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { Form, Link, redirect, useNavigation } from "react-router-dom"
import { HeadProvider, Title } from "react-head"


export async function loader() {
    const { fetch } = useDns.getState()
    return await fetch()
}

export async function action({ request }: { request: Request }) {
    const form = Object.fromEntries(await request.formData()) as any
    const providerId = parseInt(form["providerId"])
    const { createCredential, setCredentialId } = useDns.getState()
    const result = await createCredential(providerId, form)
    if (result.errors && Array.isArray(result.errors)) {
        return result.errors[0].message
    } else {
        setCredentialId(result.id)
        return redirect('/certificate/create/finish')
    }
}


export function Component() {
    const providers = useDataFromLoader(loader)
    const { providerId, setProviderId, getProvider, test } = useDns()
    const { t } = useTranslation('translation')
    const provider = getProvider()

    const navigation = useNavigation()
    const isSubmitting = navigation.state === 'submitting'

    const [ credential, setCredential ] = useState<Credential>({})
    const onInputCredential = (name: string, input: CredentialItem) => {
        credential[name] = input
        setCredential({ ...credential })
    }
    const setProvider = (provider?: Provider) => {
        if (provider) {
            if (!credential?.[provider.name]) {
                credential[provider.name] = {}
            }
            setProviderId(provider.id)
        }
    }
    const onChange: FormEventHandler<HTMLSelectElement> = (e) => {
        const found = providers.find(item => item.id === parseInt(e.currentTarget.value))
        setProvider(found)
    }
    // init provider
    useEffect(() => setProvider(provider), [])

    const onTesting = async () => {
        if (!provider) {
            return { success: false }
        }
        return test(provider.id, credential[provider.name])
    }

    const isReady = useMemo(() => {
        if (!provider || !credential?.[provider.name]) {
            return false
        }
        return !!credential[provider.name].name
    }, [ credential, provider ])

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
            {t('certificate.select_DNS_provider')}
        </label>
        <select
            id="account"
            value={providerId}
            name="providerId"
            onChange={onChange}
            className="select select-bordered text-xl w-full max-w-xs mt-2">
            {providers.map(provider => <option key={`dns-provider-${provider.id}`} value={provider.id}>
                {provider.name}
            </option>)}
        </select>
        {!!provider && <>
            <label className="mt-4 block text-lg font-semibold leading-6 text-gray-900">
                {t('certificate.create_DNS_credential', { name: provider.name })}
            </label>
            <div className="py-2 px-6 mt-4 border-l-4 max-w-lg">
                {credential[provider.name] && <InputCredential
                    key={provider.name}
                    inputConfig={provider.inputConfig}
                    onInput={(credential) => onInputCredential(provider.name, credential)}
                    value={credential[provider.name]}
                />}
            </div>
            <ul className="mt-4 mx-6 list-disc">
                <li>
                    <Link
                        target={"_blank"}
                        className="link"
                        to={provider.link}
                    >
                        {t(`dnsProvider.${provider.name}.create_link_instruction`)}
                    </Link>
                </li>
                {t(`dnsProvider.${provider.name}.instruction`) && <li>{t(`dnsProvider.${provider.name}.instruction`)}</li>}
            </ul>
        </>}
        {errorMessage && <div className="mt-4 alert alert-error shadow-lg">{errorMessage}</div>}
        <div className="mt-4">
            {!isSubmitting && <button type="submit" disabled={!isReady} className="btn btn-primary btn-lg">{t('certificate.next')}</button>}
            {isSubmitting && <button disabled={true} className="btn btn-primary btn-lg">
                <IconLoading /> {t('certificate.next')}</button>}
            <Link className="ml-4 link" to={'../dns'}>Go back</Link>
            <LinkTest className="ml-4" onTesting={onTesting} />
        </div>
    </Form>
}

interface LinkTestProps {
    onTesting: () => Promise<TestCredentialResponse>
    className?: string
}

/**
 * 
 * @param param0.onTesting Callback onClick, return the test result
 * @param param0.className Optional string className, for Icons
 * @returns 
 */
function LinkTest({ onTesting,  className }: LinkTestProps) {
    const { t } = useTranslation("translation")
    const [ testing, setTesting ] = useState(false)
    const [ succeed, setSucceed ] = useState<boolean>()
    const [ errorMessage, setErrorMessage ] = useState('')
    const onClick = async () => {
        setSucceed(undefined)
        setTesting(true)
        setErrorMessage('')
        const res = await onTesting()
        setSucceed(res.success)
        if (res.errors && res.errors.length > 0) {
            setErrorMessage(res.errors[0].message)
        }
        setTesting(false)
    }
    if (succeed !== undefined) {
        if (succeed) {
            return <>
                <span className="text-success font-bold">
                    <IconChecked className={`w-6 h-6 align-text-top inline-block  ${className ?? ''}`} /> {t('succeed')}
                </span>
                <span onClick={onClick} className="link ml-2">{t('retry')}</span>
            </>
        } else {
            return <>
                <span className="text-warning font-bold">
                    <IconInfo className={`w-6 h-6 text-warning align-text-top inline-block ${className ?? ''}`} /> {errorMessage || t('failed')}
                </span>
                <span onClick={onClick} className="link ml-2">{t('retry')}</span>
            </>
        }
    } else if (testing) {
        return <span className="text-stone-500">
            <IconLoading className={`w-6 h-6 inline-block align-text-top ${className ?? ''}`} /> {t('testing')}
        </span>
    } else {
        return <span onClick={onClick} className={`link ${className ?? ''}`}>{t('certificate.test')}</span>
    }
}

interface InputCredentialProps {
    inputConfig: InputConfig[]
    value: CredentialItem
    onInput: (value: CredentialItem) => void
}
function InputCredential({ inputConfig, value, onInput }: InputCredentialProps) {
    const onItemInput = (name: string, val: string) => {
        value[name] = val
        onInput(value)
    }
    return <>
        {inputConfig.map(input => <div key={`input-${input.name}`}>
            <InputCredentialItem
                input={input}
                onInput={val => onItemInput(input.name, val)}
                // must not be `undefined`
                value={value?.[input.name] ?? ''}
            />
        </div>)}
    </>
}

interface InputCredentialItemProps {
    input: InputConfig
    value: string
    onInput: (value: string) => void
}
function InputCredentialItem({ input, value, onInput }: InputCredentialItemProps) {
    const { t } = useTranslation("translation")
    return <div>
        <label htmlFor={input.name} className="my-2 block text-lg font-semibold leading-6 text-gray-900 capitalize">
            {input.name === 'name' ? t('certificate.credential_name') : input.name}
        </label>
        <input
            name={input.name}
            placeholder={t("input", { name: input.name }) || ''}
            className="input input-bordered my-2 w-full placeholder:capitalize"
            type={input.type}
            value={value}
            onInput={e => onInput(e.currentTarget.value)}
        />
    </div>
}
