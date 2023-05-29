import { create } from "zustand"
import { persist } from 'zustand/middleware'
import { getUserDefaultLanguage, resources } from './'
import i18n from "i18next"
import ICU from "i18next-icu"
import { initReactI18next } from "react-i18next"


interface LocaleStoreState {
    locale: string
    setLocale: (locale: string) => void
    init: () => void
    addResourceBundle: (lng: string, ns: string, resources: Record<string, any>) => void
}

const useLocaleStore = create(
    persist<LocaleStoreState>((set, get) => ({
        locale: getUserDefaultLanguage('en'),
        init: () => {
            i18n.use(initReactI18next)
                .use(ICU)
                .init({
                    resources,
                    lng: get().locale,
                    interpolation: {
                        escapeValue: false, // react already safes from xss
                    },
                })
        },
        addResourceBundle: (lng: string, ns: string, resources: Record<string, any>) => {
            if (!i18n.hasResourceBundle(lng, ns)) {
                i18n.addResourceBundle(lng, ns, resources)
            }
        },
        setLocale: (locale: string) => {
            return set({ locale })
        },
    }), {
        name: 'locale'
    })
)

export default useLocaleStore
