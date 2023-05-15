import { HeadProvider, Title } from "react-head"
import { useTranslation } from "react-i18next"
import useDns from "@/data/use-dns"
import { useDataFromLoader } from "@/utils/router"
import { IconCloud, IconInfo } from "@/assets/Icons"
import TFootPagination from "@/components/TFootPagination"
import Dropdown from "@/components/Dropdown"
import { ButtonTest } from "@/components/ButtonTest"

export async function loader({ request }: { request: Request }) {
    const url = new URL(request.url)
    const page = url.searchParams.get('page') || "1"
    const results = await useDns.getState().fetchCredentials(0, parseInt(page))
    if (results.meta.total > 0) {
        return {
            credentials: results
        }
    } else {
        // Load Animation Data
        return {
            // animationData: await res.json(),
            credentials: results
        }
    }
}


export function Component() {
    const { credentials } = useDataFromLoader(loader)
    const { t } = useTranslation("translation")
    
    const onTesting = async (id: number) => {
        return useDns.getState().testCredential(id)
    }

    return <>
        <HeadProvider>
            <Title>{t('nav.DNS_verification')}</Title>
        </HeadProvider>
        <div className="main-container">
            <div className="table-container">
                <table className="main-table">
                    <thead>
                        <tr>
                            <th>{t('certificate.credential_name')}</th>
                            <th>{t('certificate.cert_dns_provider')}</th>
                            <th className="w-72">
                                {t('certificate.test')}
                                <div className="tooltip" data-tip={t('certificate.test_dns_provider_description')}>
                                    <IconInfo className="w-5 h-5 ml-1 align-text-bottom" />
                                </div>
                            </th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {credentials.data.map(item => <tr key={`credential-${item.id}`}>
                            <td>{item.name}</td>
                            <td>{item.provider.name}</td>
                            <td>
                                <ButtonTest onTesting={() => onTesting(item.id)}>
                                    <div className="block text-gray-400 text-sm hover:text-gray-800 hover:underline underline-offset-2 decoration-1 decoration-slate-500 cursor-pointer">
                                        <IconCloud className="w-4 h-4 align-text-bottom inline mr-1" />{t('certificate.test')}
                                    </div>
                                </ButtonTest>
                            </td>
                            <td className="w-16">
                                <Dropdown>
                                    <Dropdown.Item>
                                        <span className="md:text-red-600 cursor-not-allowed md:hover:text-red-500 md:hover:bg-red-50">{t('certificate.cert_archive')}</span>
                                    </Dropdown.Item>
                                </Dropdown>
                            </td>
                        </tr>)}
                    </tbody>
                    <TFootPagination value={credentials} />
                </table>
            </div>
        </div>
    </>
}
