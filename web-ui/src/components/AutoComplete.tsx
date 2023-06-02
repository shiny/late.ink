
import { Fragment, ReactElement, useEffect, useMemo, useState, Ref } from "react"
import type { Pagination } from "@late/Response"
import { Combobox, Transition } from '@headlessui/react'
import { debounce } from "@/utils/helper"

interface AutoCompleteInterface<T> {
    className?: string
    placeholder?: string
    onSearch?: (term: string) => Promise<Pagination<T>>
    onChange?: (item: T) => void
    displayValue?: (item: T) => string
    optionKey?: (item: T) => string
    displayOption?: ({ selected, active, item }: { selected: boolean, active: boolean, item: T }) => ReactElement
    inputRef?: Ref<HTMLInputElement>
}

export default function AutoComplete<T>(props: AutoCompleteInterface<T>) {
    const [items, setItems] = useState<T[]>([])
    const search = useMemo(() => {
        return debounce(async (value: string) => {
            if (props.onSearch) {
                const result = await Promise.resolve(props.onSearch(value))
                setItems(result.data)
            }
        }, 500)
    }, [])

    return (
        <Combobox nullable onChange={props.onChange}>
            <div className={`relative ${props.className ?? ''}`}>
                <div className="relative w-full cursor-default">

                    <Combobox.Input
                        ref={props.inputRef}
                        displayValue={props.displayValue}
                        placeholder={props.placeholder}
                        className="bg-[#faf7f5] rounded-lg w-full py-2 pl-3 pr-10 text-xl leading-5 rounded-md focus:shadow focus:outline outline outline-1 outline-stone-300 focus:outline-[--primary-color] focus:outline-2"
                        onChange={(event) => search(event.target.value)}
                    />
                </div>
                {items.length > 0 && <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <Combobox.Options
                        className="absolute z-10 mt-1 max-h-96 w-full overflow-auto rounded-md bg-[#faf7f5] py-1 text-2xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {items.map((item, index) => (
                            <Combobox.Option
                                key={(props?.optionKey && props.optionKey(item)) ?? `option-${index}`}
                                className={'relative cursor-default select-none py-2 pl-4 pr-4 text-gray-900 ui-active:bg-[--primary-color] ui-active:text-gray-900'}
                                value={item}
                            >
                                {({ active, selected }) => {
                                    if (props.displayOption) {
                                        return props.displayOption({ active, selected, item })
                                    } else {
                                        return <>
                                        </>
                                    }
                                }}
                            </Combobox.Option>
                        ))}
                    </Combobox.Options>
                </Transition>}
            </div>
        </Combobox>
    )
}
