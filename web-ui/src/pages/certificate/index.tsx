import Lottie from "lottie-react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import certificate from "@/assets/certificate-cuy.json?url"
import { useDataFromLoader } from "@/utils/router"
import useCertificate from "@/data/use-certificate"
import { IconPlay } from "@/assets/Icons"
import { DateTime } from "@/components/DateTime"
import TFootPagination from "@/components/TFootPagination"
import { Tooltip } from 'react-tooltip'
import { HeadProvider, Title } from "react-head"
import Dropdown from "@/components/Dropdown"

export async function loader({ request }: { request: Request }) {
    const url = new URL(request.url)
    const page = url.searchParams.get('page') || "1"
    const results = await useCertificate.getState().refresh(parseInt(page))

    if (results.meta.total > 0) {
        return {
            certificates: results
        }
    }
    const res = await fetch(certificate)
    return {
        animationData: await res.json(),
        certificates: results
    }
}

export function Component() {

    const { t } = useTranslation("translation")

    const { animationData, certificates } = useDataFromLoader(loader)

    if (certificates.meta.total > 0) {
        return <div className="main-container">
            <HeadProvider>
                <Title>{t('nav.cert')}</Title>
            </HeadProvider>
            <div className="flex justify-between">
                <input type="text" placeholder={t('certificate.search') ?? ''} className="input input-md rounded-lg shadow w-full max-w-sm text-lg cursor-not-allowed" />
                <Link to={`/certificate/create/domain`} className="btn btn-primary btn-base rounded-lg">🚀 {t('certificate.create_cert')}</Link>
            </div>
            <div className="table-container">
                <table className="main-table cursor-pointer">
                    <thead>
                        <tr>
                            <th>{t('certificate.cert_domain')}</th>
                            <th>{t('certificate.cert_expired')}</th>
                            <th>{t('certificate.cert_authority')}</th>
                            <th>{t('certificate.cert_dns_provider')}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {certificates.data.map(cert => <tr key={`cert-${cert.id}`}>
                            <td>
                                <Tooltip openOnClick={true} place="right" id={`tooltip-${cert.id}`}>
                                    <div className="font-bold">{t('certificate.cert_domain_tooltips')}</div>
                                    <ul>
                                        {cert.domains.map((domain, index) => <li className="block" key={`${domain}-${index}`}>{domain}</li>)}
                                    </ul>
                                </Tooltip>
                                <div className="">

                                    <span
                                        className="font-bold">
                                        {cert.domains[0]}
                                    </span>
                                    {cert.domains.length > 1 && <span
                                        className="ml-2 "
                                        data-tooltip-id={`tooltip-${cert.id}`}>
                                        <IconPlay
                                            className="inline-block w-3 h-3 rotate-90 text-gray-300 hover:text-gray-600 -mt-[3px]" />
                                    </span>}
                                </div>
                                <div className="badge badge-outline">{cert.algorithm}</div>
                            </td>
                            <td className="w-48 text-base font-semibold">{cert.expiredAt && <DateTime value={cert.expiredAt} />}</td>
                            <td className="w-36 text-base">{cert.order.authority.ca}</td>
                            <td className="w-48 text-base">{t(`dnsProvider.${cert.order.dnsProviderCredential.provider.name}.name`)}</td>
                            <td className="w-12 text-right">
                                <Dropdown>
                                    <Dropdown.Item>
                                        <Link target="_blank" to={`/api/v1/certificate/${cert.id}/download`}>{t('certificate.cert_download')}</Link>
                                    </Dropdown.Item>
                                    <Dropdown.Divide />
                                    <Dropdown.Item>
                                        <span className="md:text-red-600 cursor-not-allowed md:hover:text-red-500 md:hover:bg-red-50">{t('certificate.cert_archive')}</span>
                                    </Dropdown.Item>
                                </Dropdown>
                            </td>
                        </tr>)}
                    </tbody>
                    <TFootPagination value={certificates} />
                </table>
            </div>
        </div>
    } else {
        return <div className="hero min-h-[80vh]">
            <div className="hero-content text-center">
                <div className="max-w-md">
                    <Lottie loop={false} animationData={animationData} />
                    <h1 className="text-5xl font-bold">{t('introduce.first_cert')}</h1>
                    <p className="py-6">{t('introduce.first_cert_description')}</p>
                    <Link to="/certificate/create/domain">
                        <button className="btn btn-primary">{t('introduce.get_started')}</button>
                    </Link>
                    <label htmlFor="my-drawer-2" className="btn btn-primary drawer-button lg:hidden">Open drawer</label>
                </div>
            </div>
        </div>
    }
}
