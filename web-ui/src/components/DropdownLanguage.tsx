import Locales from '@/locales'
import useLocaleStore from "@/locales/store"
import { changeLanguage } from 'i18next'
import { IconLang } from '@/assets/Icons'

/**
 * Click the dropdown button again to close dropdown
 * https://github.com/saadeghi/daisyui/issues/157
 * @param e
 */
function closeDropDown(e: any) {

    // const setLocalePersistently = useLocaleStore.getState().setLocalePersistently
    // setLocalePersistently(locale)
    const targetEl = e.currentTarget
    if (targetEl && targetEl.matches(':focus')) {
        setTimeout(function () {
            targetEl.blur()
        }, 0)
    }
}

export default function DropdownLanguage() {
    const {
        locale,
        setLocale
    } = useLocaleStore()

    const onClick = (e: any, locale: string) => {
        setLocale(locale)
        changeLanguage(locale)
        closeDropDown(e)
    }

    return <div className="dropdown dropdown-end dropdown-hover">
        <label tabIndex={0} className="cursor-pointer hover:underline block px-2 py-4 text-lg underline-offset-4 decoration-2 decoration-[#abd4cb]">
            <IconLang className='inline w-6' />
            / {Locales.getLanguage(locale)}</label>
        <ul tabIndex={0} className="menu dropdown-content p-3 w-56 m-0 shadow bg-base-100 rounded-box ml-2">
            {Locales.languages.map(language => <li key={language.locale}>
                <span className='p-2 hover:text-neutral-950'
                    onClick={e => onClick(e, language.locale)}
                >
                    {language.name}
                </span>
            </li>)}
        </ul>
    </div>
}
