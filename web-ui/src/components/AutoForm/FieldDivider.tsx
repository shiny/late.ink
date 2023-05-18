import { useTranslation } from 'react-i18next'
import { InputFieldProps } from '.'

/**
 * Divider line in form
 * @param param0 
 * @returns 
 */
export default function FieldDivider({ config, className, localeNamespace }: InputFieldProps) {
    const { t } = useTranslation(localeNamespace)
    return <div className={`divider ml-[25%] mt-8 mb-10 before:w-12 before:grow-0 ${className ?? ''}`}>
        {t(config.name)}
    </div>
}
