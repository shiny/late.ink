import { IconLoading } from "@/assets/Icons"
import { PropsWithChildren } from "react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Form, useNavigation, useSubmit } from "react-router-dom"

export default function FormLogin({ children }: PropsWithChildren) {

    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const { t } = useTranslation('translation', {
        keyPrefix: 'loginPage.form'
    })

    const navigation = useNavigation()

    const isAvailble = () => {
        return name !== '' && password !== ''
    }

    const isSubmitting = () => navigation.state === 'submitting'

    return <Form method="POST">
        <div>
            <h1 className="text-2xl">{t('title')}</h1>
        </div>
        <div className="mt-5">
            <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="input input-bordered w-full"
                name="name"
                placeholder={t('login') ?? ''}
            />
        </div>
        <div className="mt-5">
            <input
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input input-bordered w-full"
                name="password"
                placeholder={t('password') ?? ''}
                type="password"
            />
        </div>
        {children}
        <button
            className="btn btn-primary btn-block mt-5"
            disabled={!isAvailble() || isSubmitting()}
            type="submit"
        >
            {isSubmitting() && <>
                <IconLoading className="w-6 h-6 mr-4" />
                {t('submitting...')}
            </>}
            {!isSubmitting() && t('login')}
        </button>
    </Form>
}

FormLogin.ErrorInfo = function ErrorInfo({ errors }: { errors: { message: string }[] }) {
    return <>
        {errors.length > 0 && <div className="alert alert-error mt-5">
            {errors.map(({ message }, index) => <span key={index}>
                {message}
            </span>)}
        </div>}
    </>
}
