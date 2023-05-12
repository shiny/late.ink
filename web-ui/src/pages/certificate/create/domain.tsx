
import { IconAdd, IconInfo } from "@/assets/Icons"
import { useDataFromLoader } from "@/utils/router"
import { KeyboardEvent, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { Form, redirect, useNavigation, useSubmit } from "react-router-dom"
import { DomainState, useDomains } from "@/data/use-form"
import { isDeletingKey, isEnterKey, isTabKey } from '@/utils/keyborad'
import { HeadProvider, Title } from "react-head"

export function loader() {
    return useDomains.getState().domains
}

export async function action({ request }: { request: Request }) {
    const formValues = (await request.formData()).values() as any
    const domains: DomainState['domains'] = Array.from(formValues)
    useDomains.getState().setDomains(domains)
    return redirect('/certificate/create/ca')
}

export function Component() {
    const defaultDomains = useDataFromLoader(loader)
    const initlizedDomains = defaultDomains.length === 0 ? [''] : defaultDomains
    const [domains, setDomains] = useState<DomainState["domains"]>(initlizedDomains)

    const availableDomains = domains
        .filter(item => item.trim() !== '')
        .filter(item => item.includes('.'))


    const { t } = useTranslation('translation', { keyPrefix: "certificate" })

    const updateInput = (index: number, value: string) => {
        domains[index] = value
        setDomains([...domains])
    }

    const isFormReady = () => {
        return availableDomains.length > 0
    }

    const formRef = useRef<(HTMLFormElement | null)>(null)
    const inputsRef = useRef<(HTMLInputElement | null)[]>([])

    const onKeyDown = (index: number, e: KeyboardEvent) => {
        const key = e.key
        if (domains[index] === '' && isDeletingKey(key) && domains.length > 1) {
            domains.splice(index, 1)
            inputsRef.current.splice(index, 1)
            setDomains([...domains])
            inputsRef.current[index - 1]?.focus()
            e.preventDefault()
        } else if (isTabKey(key)) {
            if (index === (domains.length - 1)) {
                e.preventDefault()
                domains.push('')
                setDomains([...domains])
                inputsRef.current[index]?.focus()
            }
        }
    }
    const submit = useSubmit()
    const onKeyUp = (index: number, e: KeyboardEvent) => {
        const key = e.key
        if (isEnterKey(key)) {
            submit(formRef.current)
        }
    }

    const createNewInput = () => {
        domains.push('')
        setDomains([...domains])
    }

    const { state } = useNavigation()
    const submitting = state === 'submitting'

    return <div>
        <HeadProvider>
            <Title>{t('input_domains')}</Title>
        </HeadProvider>
        <Form ref={formRef} method="post" className="mt-2 grid gap-2">
            <h2 className="text-2xl font-semibold leading-7 text-gray-900">{t('cert_domain')}
                <div className="tooltip" data-tip="Subjective Alternative Name">
                    <IconInfo className="w-6 h-6" />
                </div>
            </h2>
            <p className="mt-1 text-base leading-6 text-gray-600">
                This information will be displayed publicly so be careful what you share.
            </p>
            <div>
                {domains.map((domain, index) => <div
                    key={`domain-${index}`}
                    className="flex mt-2 rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-[--primary-color]"
                >
                    <span className="flex select-none items-center pl-3 text-gray-500 text-2xl">https://</span>
                    <input
                        spellCheck={false}
                        autoFocus={index === domains.length - 1}
                        type="text"
                        name="domain[]"
                        autoComplete="domain"
                        className="text-2xl font-semibold block flex-1 border-0 bg-transparent py-2 pl-1 text-gray-900 placeholder:text-gray-400 ring-0 outline-none"
                        placeholder="example.com or *.example.com"
                        ref={el => inputsRef.current[index] = el}
                        value={domain}
                        onChange={(e) => updateInput(index, e.target.value)}
                        onKeyDown={(e) => onKeyDown(index, e)}
                        onKeyUp={(e) => onKeyUp(index, e)}
                    />
                </div>)}
            </div>
            <div className="mt-2">
                <a className="link" onClick={createNewInput}>
                    <IconAdd className="w-4 h-4 align-middle inline-block" />
                    {t('append_domain')}
                </a>
            </div>
            <div className="mt-4">
                <button type="submit" disabled={!isFormReady() || submitting} className="btn btn-primary btn-lg">{t('next')}</button>
            </div>
        </Form>
    </div>
}
