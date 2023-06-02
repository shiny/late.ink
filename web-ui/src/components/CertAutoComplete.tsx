
import AutoComplete from '@/components/AutoComplete'
import { Certificate } from '@/data/use-certificate'
import { useTranslation } from 'react-i18next'
import { DateTime } from './DateTime'
import { Pagination } from '@late/Response'
import { Ref } from 'react'

const Component = AutoComplete<Certificate>

interface CertAutoCompleteInterface {
    onSearch?: (value: string) => Promise<Pagination<Certificate>>
    onChange?: (item: Certificate) => void
    className?: string
    inputRef?: Ref<HTMLInputElement>
}

export default function CertAutoComplete(props: CertAutoCompleteInterface) {
    const { t } = useTranslation("translation")

    return <Component
        inputRef={props.inputRef}
        className={props.className}
        onSearch={props.onSearch}
        onChange={props.onChange}
        optionKey={(item) => `option-${item.id}`}
        displayValue={(item) => item && item.domains[0]}
        displayOption={({ active, item }) => <div>
            <div className="flex gap-2 items-center">
                <div className={`grow ${active ? 'font-bold' : ''}`}>{item.domains[0]}</div>
                <div className="flex-none badge badge-outline badge-sm">{item.algorithm}</div>
                <div className="flex-none badge badge-sm">{t('deployment.cert_expired')} <DateTime value={item.expiredAt} /></div>
            </div>
            <div className="flex text-gray-600 text-base gap-2">
                <div className="grow">{item.domains.map((domain, index) => <span
                    key={`${domain}-${index}`}
                    className={index === 0 ? `hidden` : active ? 'font-bold' : ''}
                >{domain}</span>)}
                </div>
                <div className="text-gray-500 flex-none">{t('deployment.issued_via')} {item.order.authority.ca},</div>
                <div className="text-gray-500 flex-none">{t('deployment.dns_provider')} {item.order.dnsProviderCredential.provider.name}</div>
            </div>
        </div>}
        placeholder={t('deployment.cert_input_placeholder') ?? ''}
    />
}
