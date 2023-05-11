import Lottie from "lottie-react"
import { useTranslation } from "react-i18next"
import { Link, useSearchParams } from "react-router-dom"
import certificate from "@/assets/certificate-cuy.json?url"
import { useDataFromLoader } from "@/utils/router"
import useCertificate from "@/data/use-certificate"
import { IconMore, IconPlay } from "@/assets/Icons"
import { DateTime } from "@/components/DateTime"
import Pagination from "@/components/Pagination"
import { Tooltip } from 'react-tooltip'

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
    const [, setSearchParams] = useSearchParams()

    const { animationData, certificates } = useDataFromLoader(loader)

    if (certificates.meta.total > 0) {
        return <div className="px-10 max-w-7xl">
            <div className="flex justify-between">
                <input type="text" placeholder={t('certificate.search') ?? ''} className="input input-md rounded-lg shadow w-full max-w-sm text-lg cursor-not-allowed" />
                <Link to={`/certificate/create/domain`} className="btn btn-primary btn-base rounded-lg">🚀 {t('certificate.create_cert')}</Link>
            </div>
            <div className="my-5 py-2 pb-6 px-6 rounded-2xl bg-[#faf7f5] shadow">
                <table className="sm:overflow-auto table-auto text-lg w-full ">
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
                            <td className="w-36 text-base font-semibold">{cert.expiredAt && <DateTime value={cert.expiredAt} />}</td>
                            <td className="w-36 text-base">{cert.order.authority.ca}</td>
                            <td className="w-48 text-base">{t(`dnsProvider.${cert.order.dnsProviderCredential.provider.name}.name`)}</td>
                            <td className="w-12 text-right">
                                <div className="dropdown dropdown-end">
                                    <label tabIndex={0}><IconMore className="w-8 h-8 inline-block cursor-pointer text-gray-400 hover:text-accent" /></label>
                                    <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                                        <li className="border-b pb-1"><Link target="_blank" to={`/api/v1/certificate/${cert.id}/download`}>{t('certificate.cert_download')}</Link></li>
                                        <li><span className="md:text-red-600 cursor-not-allowed md:hover:text-red-500 md:hover:bg-red-50">{t('certificate.cert_archive')}</span></li>
                                    </ul>
                                </div>
                            </td>
                        </tr>)}
                    </tbody>
                    <tfoot>
                        <tr>
                            <th colSpan={3} align="left">
                                <Pagination
                                    className="pt-4 px-4"
                                    perPage={certificates.meta.per_page}
                                    total={certificates.meta.total}
                                    page={certificates.meta.current_page}
                                    goto={page => setSearchParams({ page: page.toString() })}
                                />
                            </th>
                        </tr>
                    </tfoot>
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
