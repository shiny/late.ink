import { IconChecked, IconInfo, IconLoading } from "@/assets/Icons"
import { useState, PropsWithChildren } from "react"
import { useTranslation } from "react-i18next"

interface Error {
    message: string
}
interface ButtonTestProps extends PropsWithChildren {
    onTesting: () => Promise<{ success?: boolean, errors?: Error[] }>
    className?: string
}

/**
 * 
 * @param param0.onTesting Callback onClick, return the test result
 * @param param0.className Optional string className, for Icons
 * @returns 
 */
export function ButtonTest({ onTesting, className, children }: ButtonTestProps) {
    const { t } = useTranslation("translation")
    const [testing, setTesting] = useState(false)
    const [succeed, setSucceed] = useState<boolean>()
    const [errorMessage, setErrorMessage] = useState('')
    const onClick = async () => {
        setSucceed(undefined)
        setTesting(true)
        setErrorMessage('')
        const res = await onTesting()
        setSucceed(res.success)
        if (res.errors && res.errors.length > 0) {
            setErrorMessage(res.errors[0].message)
        }
        setTesting(false)
    }
    if (succeed !== undefined) {
        if (succeed) {
            return <>
                <span className="text-base text-gray-800 font-bold">
                    <IconChecked className={`w-5 h-5 text-base align-text-bottom inline-block  ${className ?? ''}`} /> {t('succeed')}
                </span>
            </>
        } else {
            return <div className="tooltip tooltip-bottom before:text-xl before:px-4" data-tip={errorMessage}>
                <div className="text-base text-gray-600">
                    <IconInfo className={`w-5 h-5 text-warning align-text-bottom inline-block ${className ?? ''}`} /> {t('failed')}
                    <span onClick={onClick} className="link ml-2">{t('retry')}</span>
                </div>
            </div>
        }
    } else if (testing) {
        return <span className="text-sm text-stone-500">
            <IconLoading className={`w-4 h-4 inline-block align-text-bottom ${className ?? ''}`} /> {t('testing')}
        </span>
    } else {
        return <div onClick={onClick} className={`${className ?? ''}`}>
            {children}
        </div>
    }
}
