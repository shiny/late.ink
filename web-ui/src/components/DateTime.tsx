import moment from "moment"
import { useTranslation } from "react-i18next"

export function DateTime({ value }: { value: string }) {
    const { t } = useTranslation("translation")
    return <>{moment(value).format(t('datetime.short').toString())}</>
}
