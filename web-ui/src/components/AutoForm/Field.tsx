import { createElement } from "react"
import { InputFieldProps } from "."
import FieldDivider from "./FieldDivider"
import FieldText from "./FieldText"

export default function Field(props: InputFieldProps) {
    switch (props.config.type) {
    case 'divider':
        return createElement(FieldDivider, props)
    case 'text':
        return createElement(FieldText, props)
    default:
        throw new Error(`Unknow input type ${props.config.type}`)
    }
}
