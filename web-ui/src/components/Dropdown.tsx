import { IconMore } from "@/assets/Icons"
import { PropsWithChildren } from "react"

interface PropsWithClassName {
    className?: string
}

export default function Dropdown(props: PropsWithChildren<PropsWithClassName>) {
    const elements = Array.isArray(props.children) ? props.children : [props.children]
    const childComponents = [Dropdown.Item, Dropdown.Divide, Dropdown.More]
    const label = elements.find(child => !childComponents.includes(child.type))
    return <div className="dropdown dropdown-end">
        <label tabIndex={0}>
            {label || <Dropdown.More />}
        </label>
        <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
            {elements
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
    return <div className={`inline-block ${props.className ?? ''} align-text-bottom hover:bg-zinc-200 rounded  text-gray-400 hover:text-gray-600 transition py-1 px-1 m-0`}>
        <IconMore className={`w-8 h-8 block cursor-pointer`} />
    </div>
}
