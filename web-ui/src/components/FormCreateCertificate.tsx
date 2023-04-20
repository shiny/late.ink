import { useState } from "react"
import InputDomains from "./FormCreateCerificate/InputDomains"
import SelectCaAccount from "./FormCreateCerificate/SelectCaAccount"
import SelectDnsProvider from "./FormCreateCerificate/SelectDnsProvider"
import PanelFinishOrder from "./FormCreateCerificate/PanelFinishOrder"
import { useTranslation } from "react-i18next"

export default function FormCreateCertificate() {
    const { t } = useTranslation('translation', {
        keyPrefix: 'certificate'
    })

    const [step, setStep] = useState(1)
    const [domains, setDomains] = useState<string[]>([])

    const onSubmitDomains = (value: string[]) => {
        setDomains(value)
        setStep(2)
    }
    const createStepClassName = (currentStep: number, step: number): string => {
        if (currentStep === step) {
            return `step-primary step-accent`
        } else if (currentStep > step) {
            return 'step-primary'
        } else {
            return ''
        }
    }

    const steps = [
        t('input_domains'),
        t('choose_ca_account'),
        t('DNS_Verification'),
        t('finish')
    ]

    return <div className="flex">
        <div className="flex-none py-5 px-10">
            <ul className="steps steps-vertical font-semibold text-xl">
                {steps.map((title, index) => <li
                    key={`step-${index}`}
                    className={`step ${createStepClassName(step, index + 1)}`}
                    onClick={() => setStep(index + 1)}>{title}
                </li>)}
            </ul>
        </div>
        <div className="grow bg-[#faf7f5] rounded-lg shadow m-3 p-8 max-w-4xl flex flex-col">
            <div className="grow">
                {step === 1 && <InputDomains domains={domains} onSubmit={onSubmitDomains} />}
                {step === 2 && <SelectCaAccount />}
                {step === 3 && <SelectDnsProvider />}
                {step === 4 && <PanelFinishOrder />}
            </div>
        </div>
    </div>
}
