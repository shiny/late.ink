import { IconChecked, IconInfo, IconLoading, IconServer } from "@/assets/Icons"
import { DateTime } from "@/components/DateTime"
import Dropdown from "@/components/Dropdown"
import useDeployment, { Deployment } from "@/data/use-deployment"
import useLocaleStore from "@/locales/store"
import { useDataFromLoader } from "@/utils/router"
import { t } from "i18next"
import { useEffect, useState } from "react"
import { HeadProvider, Title } from "react-head"
import { useTranslation } from "react-i18next"
import { Link, useRevalidator } from "react-router-dom"

export async function loader({ request }: { request: Request }) {
    const url = new URL(request.url)
    const page = url.searchParams.get('page') || "1"
    const result = await useDeployment.getState().refresh(parseInt(page))
    return result
}

export function Component() {
    const { addResourceBundle } = useLocaleStore()
    const { t } = useTranslation("translation")
    const result = useDataFromLoader(loader)
    const revalidator = useRevalidator()

    useEffect(() => {
        result.data.forEach(({ plugin }) => {
            const { locales, packageName } = plugin
            for (const [lng, resource] of Object.entries(locales)) {
                addResourceBundle(lng, packageName, {
                    name: t('name', { lng }),
                    'instruction.name': t('instruction.name', { lng, defaultValue: '' }),
                    'placeholder.name': t('placeholder.name', { lng, defaultValue: '' }),
                    ...resource
                })
            }
        })
    }, [result])

    const [ triggingId, setTriggingId ] = useState(0)

    const onTrigger = async (item: Deployment) => {
        if (!isJobAvailable(item)) {
            return
        }
        setTriggingId(item.id)
        await useDeployment.getState().trigger(item.id)
        setTriggingId(0)
        revalidator.revalidate()
    }

    return <>
        <HeadProvider>
            <Title>{t('nav.deployment')}</Title>
        </HeadProvider>
        <div className="main-container">
            <div className="flex justify-between">
                <input type="text" placeholder={t('deployment.search') ?? ''} className="input input-md rounded-lg shadow w-full max-w-sm text-lg cursor-not-allowed" />
                <Link to={`/deployment/create`} className="btn btn-primary btn-base rounded-lg"><IconServer className="w-5 h-5 align-text-bottom mr-1" /> {t('deployment.create')}</Link>
            </div>
            <div className="table-container">
                <table className="main-table cursor-pointer">
                    <thead>
                        <tr>
                            <th>名称</th>
                            <th>部署方式</th>
                            <th>目标</th>
                            <th>关联证书</th>
                            <th>测试</th>
                            <th>上次部署</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {result.data.map(item => <tr
                            key={`deployment-${item.id}`}
                        >
                            <td><span className="font-bold">{item.name}</span></td>
                            <td>
                                <img className="w-5 h-5 inline-block align-middle" src={`data:image/svg+xml;utf8,${item.plugin.icon}`} /> {t('plugin.name', { ns: item.plugin.packageName })}
                            </td>
                            <td>

                            </td>
                            <td>
                                {item.certificates.map(cert => <div
                                    className="badge badge-outline"
                                    key={`relation-${item.id}-${cert.id}`}
                                >
                                    {cert.domains[0]}
                                </div>)}
                            </td>
                            <td>
                            </td>
                            <td>
                                {item.jobs.length > 0 && <div>
                                    <BadgeJobStatus className="inline-block align-middle mr-1" value={item} />
                                    
                                </div>}  
                            </td>
                            <td>
                                <Dropdown>
                                    <Dropdown.Item>
                                        {triggingId === item.id && <span>
                                            <IconLoading className={`w-5 h-5 `} /> {t('deployment.status.running')}
                                        </span>}
                                        {triggingId !== item.id && <span
                                            className={
                                                `${isJobAvailable(item) ? '' : 'cursor-not-allowed sm:text-gray-500 hover:text-gray-500 bg-zinc-100 hover:bg-zinc-100'}`
                                            }
                                            onClick={() => onTrigger(item)}>
                                            触发一次部署
                                        </span>}
                                        
                                    </Dropdown.Item>
                                </Dropdown>
                            </td>
                        </tr>)}
                    </tbody>
                </table>
            </div>
        </div>
    </>
}

function isJobAvailable(item: Deployment) {
    if (item.jobs.length === 0) {
        return false
    }
    return item.jobs[0].status === 'Available'
}

function BadgeJobStatus({ value, className }: { value: Deployment, className?: string }) {
    if (value.jobs.length === 0) {
        return <></>
    }
    className = className || ''
    if (value.jobs[0].status === 'Running') {
        return <IconLoading className={`w-5 h-5 ${className}`} />
    }
    switch (value.jobs[0].lastRunStatus) {
        case 'Accomplished':
            return <div>
                <IconChecked className={`w-5 h-5 ${className}`} />
                <span className="text-base">{value.jobs[0].lastRunAt && <DateTime value={value.jobs[0].lastRunAt} />}</span>
            </div>
        case 'Error':
            return <div className="text-red-600 tooltip" data-tip={value.jobs[0].lastRunMessage}>
                <IconInfo className={`w-5 h-5 ${className}`} /> {t('deployment.status.error')}
            </div>
        default:
            return <></>
    }
}