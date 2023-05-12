import useOrder from "@/data/use-order"
import { useTranslation } from "react-i18next"
import { IconChecked, IconLoading } from "@/assets/Icons"
import useAuthority from "@/data/use-authority"
import { useEffect } from "react"
import { Link } from "react-router-dom"
import { DateTime } from "@/components/DateTime"
import { HeadProvider, Title } from "react-head"


async function process(authorityId: number, orderId: number) {
    const shouldRefresh = await useOrder.getState().process(authorityId, orderId)
    if (shouldRefresh) {
        setTimeout(() => {
            process(authorityId, orderId)
        }, 5000)
    }
}

export function Component() {

    const { t } = useTranslation('translation', {
        keyPrefix: 'certificate'
    })

    const { order, processStatus } = useOrder()
    const { authorityId } = useAuthority.getState()

    useEffect(() => {
        if (authorityId && order) {
            process(authorityId, order.id)
        }
    }, [])

    if (!order) {
        return <>
            <HeadProvider>
                <Title>{t('finish')}</Title>
            </HeadProvider>
            Order is Empty
        </>
    }
    return <div>
        <HeadProvider>
            <Title>{t('finish')}</Title>
        </HeadProvider>
        <div>
            <h2 className="text-2xl font-semibold leading-7 text-gray-900">{t('finish')}</h2>
            <div className="mt-8 px-1">
                <div className="rounded">
                    <div className="font-bold text-gray-600">{t('cert_domain')}</div>
                    <div className="mt-2 text-xl">
                        {order.authorizations.map(auth => <div className="py-2" key={auth.id}>
                            <Domain className="font-bold block" value={auth.identifierValue} isWildcard={auth.isWildcard} />
                            <Badge type='authorization' status={auth.status} />
                        </div>)}
                    </div>
                </div>
            </div>
            <div className="mt-8 px-1">
                <div className="rounded">
                    <div className="mb-2 font-bold text-gray-600">{t('certificate')}</div>
                    {/* <div className="border-t border-dashed py-1 pt-4">
                        <span className="w-32 inline-block">{t('order_status_title')}</span>
                        <Badge type='order' status={order.status} />
                    </div> */}
                    <div>
                        <span className="w-32 inline-block">{t('process_status')}</span>
                        {processStatus && <span className="font-bold">{t('order_status.'+processStatus.replace(':', '_'))}</span>}
                    </div>
                    {order?.certificate?.algorithm && <div className="py-1">
                        <span className="w-32 inline-block">{t('cert_algorithm')}</span>
                        <span className="font-bold">{order.certificate.algorithm}</span>
                    </div>}
                    {order?.certificate?.expiredAt && <div className="py-1">
                        <span className="w-32 inline-block">{t('cert_expired')}</span>
                        <span className="font-bold"><DateTime value={order.certificate.expiredAt} /></span>
                    </div>}
                    {order?.certificate?.expiredAt && <div className="py-1 mt-3">
                        <Link
                            target="_blank"
                            to={`/api/v1/certificate/${order.certificate.id}/download`}
                            className="btn btn-sm"
                        >{t('cert_download')}</Link>
                    </div>}
                </div>
            </div>
        </div>
    </div>
}

export function Domain({ value, isWildcard, className }: { value: string, isWildcard: boolean, className?: string }) {
    if (isWildcard) {
        return <span className={className ?? ''}>*.{value}</span>
    } else {
        return <span className={className ?? ''}>{value}</span>
    }
}

export function Badge({ type, status }: { type: 'authorization' | 'order', status: string }) {

    const { t } = useTranslation('translation', {
        keyPrefix: `certificate.${type}_status`
    })

    switch (status) {
    case 'pending':
    case 'ready':
        return <div className="badge align-middle badge-accent text-gray-900 font-bold">
            <IconLoading className="w-3 h-3 align-text-top mr-1" /> {t(status)}
        </div>
    case 'valid':
        return <div className="badge align-middle badge-success font-bold">
            <IconChecked className="w-3 h-3 align-text-bottom mr-1" /> {t(status)}
        </div>
    default:
        return <div className="badge align-middle badge-accent text-gray-900 font-bold">
            {t(status)}
        </div>
    }
}
