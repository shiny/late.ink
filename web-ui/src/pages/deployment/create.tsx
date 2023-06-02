import usePlugin from "@/data/use-plugin"
import { useEffect, useMemo, useRef, useState } from "react"
import { HeadProvider, Title } from "react-head"
import { useTranslation } from "react-i18next"
import useLocaleStore from '@/locales/store'
import { ButtonTest } from "@/components/ButtonTest"
import AutoForm from "@/components/AutoForm"
import { fetch } from "@/data/request"
import type { Pagination } from "@late/Response"
import { Certificate } from '@/data/use-certificate'
import CertAutoComplete from "@/components/CertAutoComplete"
import { DateTime } from "@/components/DateTime"
import { IconRepick } from "@/assets/Icons"

export function Component() {
    const { t } = useTranslation("translation")
    const { addResourceBundle } = useLocaleStore()
    const { plugins, refresh, createDeployment, validate } = usePlugin()
    const [currentPackageName, setPackageName] = useState('')
    const [ immediate, setImmediate ] = useState(true)
    const [currentCert, setCert] = useState<Certificate | null>(null)
    const onSelect = (packageName: string) => {
        setPackageName(packageName)
    }
    const currentPlugin = useMemo(() => {
        if (Array.isArray(plugins)) {
            return plugins.find(plugin => plugin.packageName === currentPackageName)
        } else {
            return null
        }
    }, [plugins, currentPackageName])

    useEffect(() => {
        plugins.forEach(({ locales, packageName }) => {
            for (const [lng, resource] of Object.entries(locales)) {
                addResourceBundle(lng, packageName, {
                    name: t('name', { lng }),
                    'instruction.name': t('instruction.name', { lng, defaultValue: '' }),
                    'placeholder.name': t('placeholder.name', { lng, defaultValue: '' }),
                    ...resource
                })
            }
        })
    }, [plugins])

    useEffect(() => {
        refresh('Deployment', 1)
    }, [])

    const onTesting = async () => {
        if (!currentPlugin) {
            return { success: false }
        }
        return validate(currentPlugin.id, result)
    }

    const [result, setResult] = useState({})

    const inputRef = useRef<HTMLInputElement>(null)
    const reSelectCert = async () => {
        await setCert(null)
        if (inputRef?.current) {
            inputRef.current.focus()
        }
    }

    const onSubmit = async () => {
        if (currentCert && currentPlugin) {
            await createDeployment({
                certId: currentCert.id,
                pluginId: currentPlugin.id,
                pluginConfig: result,
                immediate
            })
        }
    }

    return <>
        <HeadProvider>
            <Title>{t('nav.deployment')}</Title>
        </HeadProvider>
        <div className="main-container">
            <div className="bg-[#faf7f5] rounded-xl shadow my-4 mb-8 p-8 max-w-7xl ">

                <h2 className="text-2xl mb-4 font-semibold">{t('deployment.cert')}</h2>
                <div>
                    {currentCert === null && <CertAutoComplete
                        inputRef={inputRef}
                        className="max-w-4xl"
                        onSearch={async (value) => {
                            return fetch<Pagination<Certificate>>('certificate', {
                                searchParams: {
                                    domain: value
                                }
                            })
                        }}
                        onChange={(cert) => setCert(cert)}
                    />}
                    {currentCert && <ul className="grid grid-cols-3 gap-4 mt-4">
                        <li data-headlessui-state="selected" className="flex flex-col options">
                            <div className="flex">
                                <span className="grow font-bold text-xl inline-block">{currentCert.domains[0]}</span>
                                <span className="badge badge-outline flex-none">{currentCert.algorithm}</span>
                            </div>
                            <div className="flex">
                                <div className="grow">{t('deployment.cert_expired')} <DateTime value={currentCert.expiredAt} /></div>
                                <span className="badge flex-none">{currentCert.order.authority.ca}</span>
                            </div>
                        </li>
                    </ul>}
                    {currentCert && <div onClick={reSelectCert} className="cursor-pointer mt-4 mx-2 hover:text-red-500 inline-block">
                        <IconRepick className="w-6 h-6 inline-block mr-1 align-text-top" /> {t('deployment.cert_reset')}
                    </div>}
                </div>
                <h1 className="mt-8 text-2xl font-semibold">{t('deployment.select_deployment_type')}</h1>
                <ul className="grid grid-cols-3 gap-4 mt-4">
                    {plugins.map(plugin => <li
                        className=""
                        key={plugin.packageName}
                    >
                        <div
                            data-headlessui-state={plugin.packageName === currentPackageName ? 'selected' : ''}
                            className={`options`}
                            onClick={() => onSelect(plugin.packageName)}
                        >
                            <img className="opacity-70 grow-0 w-14 h-14 inline-block align-text-bottom mr-3" src={`data:image/svg+xml;utf8,${plugin.icon}`} />
                            <div className="">
                                <span className="font-bold text-xl inline-block">{t('plugin.name', {
                                    ns: plugin.packageName
                                })}
                                </span>
                                <div>
                                    {plugin.packageName}
                                </div>
                            </div>
                        </div>
                    </li>)}
                </ul>
                {currentPlugin && <>
                    <h1 className="text-2xl mb-4 mt-8 font-semibold">{t('plugin.name', {
                        ns: currentPlugin.packageName
                    })}</h1>
                    <div className="max-w-4xl">
                        <AutoForm
                            key={currentPackageName}
                            localeNamespace={currentPackageName}
                            inputConfig={[{ name: 'name', type: "text" }, ...currentPlugin.inputConfig]}
                            onInput={(value) => setResult({ ...value })}
                            fillEmptyString={true}
                            value={result}
                        />
                    </div>
                    <h1 className="my-4 text-2xl font-semibold">{t('deployment.trigger_now_title')}</h1>
                    <label  className="text-xl">
                        <input
                            value={immediate ? 1 : 0}
                            onChange={e => setImmediate(Boolean(e.currentTarget.value))}
                            className="accent-[--primary-color] w-6 h-6 mr-3 align-text-top"
                            type="checkbox"
                        />
                        {t('deployment.trigger_now_checkbox')}
                        <p className="mt-2 ml-9 text-lg text-neutral-500">{t('deployment.trigger_now_description')}</p>
                    </label>
                    <hr className="my-8" />
                    <button disabled={!currentPlugin || !currentCert} onClick={() => onSubmit()} className="btn">{t('deployment.submit')}</button>
                    <ButtonTest className="inline-block ml-5 hover:underline" onTesting={onTesting}>{t('plugin.btnTest', { ns: currentPackageName })}</ButtonTest>
                </>}
            </div>
        </div>
    </>
}


export const handle = {
    crumb: {
        title: 'deployment.create',
    }
}
