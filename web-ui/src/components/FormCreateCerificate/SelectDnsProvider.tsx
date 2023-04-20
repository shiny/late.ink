import { useTranslation } from "react-i18next"

export default function SelectDnsProvider() {
    const { t } = useTranslation('translation', {
        keyPrefix: 'certificate'
    })
    return <div>
        <h2 className="text-2xl font-semibold leading-7 text-gray-900">
            {t('DNS_Verification')}
            <div className="tooltip" data-tip="Subjective Alternative Name">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
            </div>
        </h2>
        <div className="divider" />
        <label htmlFor="account" className="block text-lg font-semibold leading-6 text-gray-900">
            选择 Dns 服务商
        </label>
        <select id="account" className="select select-bordered text-xl w-full max-w-xs mt-2">
            <option>Cloudflare</option>
            <option>阿里云</option>
            <option>腾讯云（DNSPod）</option>
        </select>
        <div className="mt-4">
            <button className="btn btn-primary btn-lg">Next</button>
        </div>
    </div>
}
