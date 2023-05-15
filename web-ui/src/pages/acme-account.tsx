import { IconCloud, IconInfo } from "@/assets/Icons"
import { ButtonTest } from "@/components/ButtonTest"
import Dropdown from "@/components/Dropdown"
import TFootPagination from "@/components/TFootPagination"
import useAuthority from "@/data/use-authority"
import { useDataFromLoader } from "@/utils/router"
import { HeadProvider, Title } from "react-head"
import { useTranslation } from "react-i18next"

export async function loader({ request }: { request: Request }) {
    const url = new URL(request.url)
    const page = url.searchParams.get('page') || "1"
    const results = await useAuthority.getState().fetchAccounts(0, parseInt(page))
    if (results.meta.total > 0) {
        return {
            accounts: results
        }
    } else {
        // Load Animation Data
        return {
            // animationData: await res.json(),
            accounts: results
        }
    }
}

export function Component() {
    const { accounts } = useDataFromLoader(loader)
    const { t } = useTranslation("translation")
    const { test } = useAuthority()

    const onTesting = async (id: number) => {
        return test(id)
    }
    
    return <>
        <HeadProvider>
            <Title>{t('nav.ACME_account')}</Title>
        </HeadProvider>
        <div className="main-container">
            <div className="table-container">
                <table className="main-table">
                    <thead>
                        <tr>
                            <th>{t('certificate.authority_account_email')}</th>
                            <th>{t('certificate.cert_authority')}</th>
                            <th className="w-72">
                                {t('certificate.test')}
                                <div className="tooltip" data-tip={t('certificate.test_acme_account_description')}>
                                    <IconInfo className="w-5 h-5 ml-1 align-text-bottom" />
                                </div>
                            </th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {accounts.data.map(item => <tr key={`credential-${item.id}`}>
                            <td className="font-bold">{item.email}</td>
                            <td>{item.authority.ca}</td>
                            <td>
                                <ButtonTest onTesting={() => onTesting(item.id)}>
                                    <div className="block text-gray-400 text-sm hover:text-gray-800 hover:underline underline-offset-2 decoration-1 decoration-slate-500 cursor-pointer">
                                        <IconCloud className="w-4 h-4 align-text-bottom inline mr-1" />{t('certificate.test')}
                                    </div>
                                </ButtonTest>
                            </td>
                            <td className="w-16">
                                <Dropdown>
                                    <Dropdown.Divide />
                                    <Dropdown.Item>
                                        <span className="md:text-red-600 cursor-not-allowed md:hover:text-red-500 md:hover:bg-red-50">{t('certificate.cert_archive')}</span>
                                    </Dropdown.Item>
                                </Dropdown>
                            </td>
                        </tr>)}
                    </tbody>
                    <TFootPagination value={accounts} />
                </table>
            </div>
        </div>
    </>
}
