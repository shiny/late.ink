import { IconMore } from "@/assets/Icons"
import { PropsWithChildren } from "react"

interface PropsWithClassName {
    className?: string
}

export default function Dropdown(props: PropsWithChildren<PropsWithClassName>) {
    if (!Array.isArray(props.children)) {
        throw new Error(`Dropdown children must be an Array`)
    }
    const childComponents = [Dropdown.Item, Dropdown.Divide, Dropdown.More]
    const label = props.children.find(child => !childComponents.includes(child.type))
    console.log('label', label)
    return <div className="dropdown dropdown-end">
        <label tabIndex={0}>
            {label || <Dropdown.More />}
        </label>
        <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
            {props.children
                .filter(child => [
                    Dropdown.Item,
                    Dropdown.Divide
                ].includes(child.type))
                .map((item) => item)}
        </ul>
    </div>
}

Dropdown.Item = function Item(props: PropsWithChildren<PropsWithClassName>) {
    return <li className={props.className ?? ''}>
        {props.children}
    </li>
}

Dropdown.Divide = function Divide(props: PropsWithChildren<PropsWithClassName>) {
    return <li className={props.className ?? 'border-b my-0'}>
        {props.children}
    </li>
}

Dropdown.More = function More(props: PropsWithChildren<PropsWithClassName>) {
    return <IconMore className={`w-8 h-8 inline-block cursor-pointer text-gray-400 hover:text-accent ${props.className ?? ''}`} />
}
