
import { IconInfo } from "@/assets/Icons"
import { KeyboardEvent, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

type Domain = string

interface InputDomainsProps {
    onSubmit?: (domains: Domain[]) => void,
    domains?: Domain[]
}

function isDeletingKey(key: string) {
    return ['Backspace', 'Delete', 'Escape'].includes(key)
}

function isEnterKey(key: string) {
    return key === 'Enter'
}

function getInitDomainsFromProps (props: { domains?: Domain[] }) {
    if (Array.isArray(props.domains) && props.domains.length > 0) {
        return props.domains
    } else {
        return [
            ''
        ]
    }
}

export default function InputDomains(props: InputDomainsProps) {

    const [ domains, setDomains ] = useState<string[]>(getInitDomainsFromProps(props))
    const availableDomains = domains.filter(item => item.trim() !== '')
    const inputsRef = useRef<(HTMLInputElement | null)[]>([])

    const { t } = useTranslation('translation', { keyPrefix: "certificate" })

    const updateInput = (index: number, value: string) => {
        domains[index] = value
        setDomains([...domains])
    }

    const onSubmit = () => {
        if (props.onSubmit && isFormReady()) {
            props.onSubmit(availableDomains)
        }
    }

    const isFormReady = () => {
        const isFormatInvaild = availableDomains.some(domain => !domain.includes('.'))
        return availableDomains.length > 0 && !isFormatInvaild
    }


    const onKeyUp = (_index: number, e: KeyboardEvent) => {
        const key = e.key
        if (isEnterKey(key)) {
            onSubmit()
        }
    }
    const onKeyDown = (index: number, e: KeyboardEvent) => {
        const key = e.key
        if (domains[index] === '' && isDeletingKey(key) && domains.length > 1) {
            domains.splice(index, 1)
            inputsRef.current.splice(index, 1)
            setDomains([...domains])
            inputsRef.current[index-1]?.focus()
            e.preventDefault()
        }
    }

    const createNewInput = () => {
        domains.push('')
        setDomains([...domains])
    }


    return <div>
        <h2 className="text-2xl font-semibold leading-7 text-gray-900">{t('cert_domain')}
            <div className="tooltip" data-tip="Subjective Alternative Name">
                <IconInfo className="w-6 h-6" />
            </div>
        </h2>
        <p className="mt-1 text-base leading-6 text-gray-600">
        This information will be displayed publicly so be careful what you share.
        </p>
        <div className="mt-2 grid gap-2">
            {domains.map((domain, index) => <div
                key={`domain-${index}`}
                className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-[--primary-color]"
            >
                <span className="flex select-none items-center pl-3 text-gray-500 text-2xl">https://</span>
                <input
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
                    onKeyUp={e => onKeyUp(index, e)}
                />
            </div>)}
        </div>
        <div className="mt-2">
            <a className="link" onClick={createNewInput}>
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 align-middle inline-block">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                {t('append_domain')}
            </a>
        </div>
        <div className="mt-4">
            <button onClick={onSubmit} disabled={!isFormReady()} className="btn btn-primary btn-lg">{t('next')}</button>
        </div>
    </div>
}
