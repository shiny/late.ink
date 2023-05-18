import { InputFieldProps } from '.'
import { createElement } from "react"
import FieldTextInstruction from './FieldTextInstruction'
import FieldTextInput from './FieldTextInput'

/**
 * text input field
 * @param props 
 * @returns 
 */
export default function FieldText(props: InputFieldProps) {
    return <div className={`flex ${props.className ?? ''}`}>
        <div className="basis-1/4 text-xl">
            {createElement(FieldTextInstruction, props)}
        </div>
        <div className="basis-3/4">
            {createElement(FieldTextInput, props)}
        </div>
    </div>
}
