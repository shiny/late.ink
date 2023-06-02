import { FormEvent, useCallback, useEffect } from "react"
import { InputFieldProps } from "."
import { useTranslation } from "react-i18next"

export default function FieldTextInput({ config, onInput, value, localeNamespace }: InputFieldProps) {

    useEffect(() => console.log('created!'), [])
    const { t } = useTranslation(localeNamespace)

    const callback = useCallback((e: FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onInput && onInput(config.name, e.currentTarget.value)
    }, [])

    if (config.rows && config.rows > 1) {
        return <textarea
            className={`textarea textarea-bordered text-xl px-2 ${config.className ?? ' w-full'}`}
            placeholder={`${t(`placeholder.${config.name}`, {
                defaultValue: ''
            })}`}
            onInput={callback}
            required={config.required}
            value={value}
            rows={config.rows}></textarea>
    } else {
        return <input
            placeholder={`${t(`placeholder.${config.name}`, {
                defaultValue: ''
            })}`}
            required={config.required}
            onInput={callback}
            value={value}
            className={`input input-bordered text-xl px-2 ${config.className ?? ' w-full'}`}
            type={config.type}
        ></input>
    }
}
