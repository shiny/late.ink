import { IconInfo } from '@/assets/Icons'
import { InputFieldProps } from '.'
import { useTranslation } from 'react-i18next'

export default function FieldTextInstruction({ config, localeNamespace }: InputFieldProps) {
    const { t } = useTranslation(localeNamespace)
    return <>
        {t(config.name)}
        {t(`instruction.${config.name}`, { defaultValue: null }) !== null && <div
            className="tooltip before:text-xl before:text-left before:px-4 before:py-2"
            data-tip={t(`instruction.${config.name}`)}
        >
            <IconInfo className="w-6 h-6" />
        </div>}
        {config.required && <span className='text-red-600'> *</span>}
    </>
}
