import { create } from "zustand"
import { persist } from 'zustand/middleware'
import { getUserDefaultLanguage, resources } from './'
import i18n, { use } from "i18next"
import ICU from "i18next-icu"
import { initReactI18next } from "react-i18next"


interface LocaleStoreState {
    locale: string
    setLocale: (locale: string) => void
    init: () => void
}

const useLocaleStore = create(
    persist<LocaleStoreState>((set, get) => ({
        locale: getUserDefaultLanguage('en'),
        init: () => {
            i18n.use(initReactI18next)
                use(ICU)
                .init({
                    resources,
                    lng: get().locale,
                    interpolation: {
                        escapeValue: false, // react already safes from xss
                    },
                })
        },
        setLocale: (locale: string) => {
            return set({ locale })
        },
    }), {
        name: 'locale'
    })
)

export default useLocaleStore
