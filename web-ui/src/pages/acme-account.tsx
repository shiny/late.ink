import { HeadProvider, Title } from "react-head"
import { useTranslation } from "react-i18next"

export function Component() {
    const { t } = useTranslation("translation")
    return <>
        <HeadProvider>
            <Title>{t('nav.ACME_account')}</Title>
        </HeadProvider>
    </>
}
