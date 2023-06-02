import { PropsWithChildren, useCallback, useState } from "react"
import Field from "./Field"

type FormValue = Record<string, string | number>

export interface InputConfig {
    name: string
    type?: 'text' | 'password' | 'number' | 'url' | 'tel' | 'email' | 'divider'
    default?: string | number
    rows?: number
    className?: string
    required?: boolean
}

export interface AutoFormProps extends PropsWithChildren {
    value?: Record<string, any>
    localeNamespace?: string
    className?: string
    fillEmptyString?: boolean
    inputConfig: InputConfig[]
    onInput?: (value: FormValue) => void
}

export interface InputFieldProps {
    config: InputConfig
    className?: string
    localeNamespace?: string
    onInput?: (name: string, value: string | number) => void,
    value?: string | number
}

/**
 * 
 * @param param0.localeNamespace ns in i18n
 * @param param0.inputConfig form input config
 * @param param0.className className for form wrapper
 * @param param0.fillEmptyString default false, fill empty string when the field value haven't inputted
 * @param param0.onInput callback: (value) => void
 * @param param0.value form value
 * @example
 * ```tsx
 * const inputConfig = [
 *     { name: 'certFilePath', type: "text", },
 *     { name: 'privateKeyPath', type: "text", },
 * ]
 * return <AutoForm
 *     localeNamespace={'@late.ink/plugin-ssh'}
 *     inputConfig={inputConfig}
 * />
 * ``` 
 * @returns 
 */
export default function AutoForm({ localeNamespace, fillEmptyString, className, inputConfig, onInput, value }: AutoFormProps) {

    const [
        uncontrolledValue,
        setUncontrolledValue
    ] = useState<FormValue>({})

    const callback = useCallback((name: string, value: string | number) => {
        uncontrolledValue[name] = value
        setUncontrolledValue((result) => {
            result[name] = value
            if (fillEmptyString) {
                inputConfig.forEach(({ name, default: defaultValue }) => {
                    if (typeof result[name] === 'undefined') {
                        result[name] = defaultValue ?? ''
                    }
                })
            }
            return {
                ...result
            }
        })
        if (onInput) {
            onInput(uncontrolledValue)
        }
    }, [])

    return <div className={className ?? ''}>
        {inputConfig.map((config) => <Field
            key={`${localeNamespace}/${config.name}`}
            localeNamespace={localeNamespace}
            className='mt-4'
            config={config}
            onInput={callback}
            value={uncontrolledValue?.[config.name] ?? value?.[config.name] ?? config.default ?? ''}
        />)}
    </div>
}
