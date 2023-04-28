import { useTranslation } from "react-i18next"
import { Outlet, useLocation, useNavigate } from "react-router-dom"


export async function action() {
    return null
}

export function Component() {

    const { t } = useTranslation('translation', {
        keyPrefix: 'certificate'
    })

    const location = useLocation()
    /**
     * 1. get the /last/path/name
     * 2. dns & dns-credential is the same step
     */
    const step = location.pathname.split('/').pop()?.split('-')[0]

    const steps = [
        {
            title: t('input_domains'),
            step: 'domain'
        },
        {
            title: t('choose_ca_account'),
            step: 'ca'
        },
        {
            title: t('DNS_Verification'),
            step: 'dns'
        },
        {
            title: t('finish'),
            step: 'finish'
        },
    ]

    const getStepLocation = (step: typeof steps[number]['step']) =>'/certificate/create/' + step

    const navigateToStep = (step: typeof steps[number]['step']) => {
        return navigate(getStepLocation(step))
    }
    const stepIndex = steps.findIndex(item => item.step === step)
    const navigate = useNavigate()

    const createStepClassName = (pageIndex: number, index: number): string => {
        if (pageIndex === index) {
            return `step-primary step-accent`
        } else if (pageIndex > index) {
            return 'step-primary'
        } else {
            return ''
        }
    }

    return <div className="px-10">
        <div>
            <div className="flex">
                <div className="flex-none py-5 px-10">
                    <ul className="steps steps-vertical font-semibold text-xl">
                        {steps.map(({ title, step }, index) => <li
                            key={`step-${index}`}
                            className={`step ${createStepClassName(stepIndex, index)}`}
                            onClick={() => navigateToStep(step)}>{title}
                        </li>)}
                    </ul>
                </div>
                <div className="grow bg-[#faf7f5] rounded-lg shadow m-3 p-8 max-w-4xl flex flex-col">
                    <div className="grow">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    </div>
}

export const handle = {
    crumb: {
        title: 'certificate.create_cert'
    }
}
