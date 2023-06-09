import { createElement } from "react"
import { InputFieldProps } from "."
import FieldDivider from "./FieldDivider"
import FieldText from "./FieldText"

export default function Field(props: InputFieldProps) {
    switch (props.config.type) {
    case 'divider':
        return createElement(FieldDivider, props)
    case 'text':
    case 'password':
    case 'number':
    case 'url':
    case 'tel':
    case 'email':
        return createElement(FieldText, props)
    default:
        throw new Error(`Unknow input type ${props.config.type}`)
    }
}
