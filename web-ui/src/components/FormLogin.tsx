import type { User } from "@/data/use-user-state"
import { KeyboardEventHandler, useState } from "react"
import { useTranslation } from "react-i18next"

interface FormLoginProps {
    onSubmit: (user: User) => Promise<any>,
    onLoggedIn: (response: any) => any
}

export default function FormLogin({ onSubmit, onLoggedIn }: FormLoginProps) {

    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [errors, setErrors] = useState([])
    const { t } = useTranslation('translation', {
        keyPrefix: 'loginPage.form'
    })

    async function submit({ name, password }: User) {
        if (!isAvailble()) {
            return
        }
        setErrors([])
        const response = await onSubmit({ name, password })
        const { success, errors } = response
        if (success) {
            onLoggedIn(response)
        } else {
            setErrors(errors)
        }
    }

    const onKeyUp: KeyboardEventHandler = ({ key }) => {
        if (key === 'Enter') {
            submit({
                name,
                password
            })
        }
    }

    const isAvailble = () => {
        return name !== '' && password !== ''
    }

    return <div>
        <div>
            <h1 className="text-2xl">{t('title')}</h1>
        </div>
        <div className="mt-5">
            <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="input input-bordered w-full"
                name="text-input-name"
                placeholder={t('login') ?? ''}
            />
        </div>
        <div className="mt-5">
            <input
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyUp={onKeyUp}
                className="input input-bordered w-full"
                name="text-input-name"
                placeholder={t('password') ?? ''}
                type="password"
            />
        </div>
        {errors.length > 0 && <div className="alert alert-error mt-5">
            {errors.map(({ message }, index) => <span key={index}>
                {message}
            </span>)}
        </div>}
        <button
            className="btn btn-primary btn-block mt-5"
            disabled={!isAvailble()}
            onClick={() => submit({ name, password })}
        >
            {t('login')}
        </button>
    </div>
}
