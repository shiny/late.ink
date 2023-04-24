import { IconLoading } from "@/assets/Icons";
import { PropsWithChildren } from "react";
import { useTranslation } from "react-i18next";

interface Props {
    loading: boolean
    className?: string
    tips?: string
}

export default function Loading({ loading, tips, className, children }: PropsWithChildren<Props>) {
    const { t } = useTranslation("translation")
    if (loading) {
        return <div className={className ?? ''}>
            <IconLoading className='inline-block align-middle' />
            <span className="inline-block mt-5 pl-2">{tips || t('loading')}</span>
        </div>
    } else {
        return <>
            {children}
        </>
    }
}
