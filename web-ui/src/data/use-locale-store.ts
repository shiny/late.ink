import { create } from "zustand"

interface LocaleStoreState {
    locale: string
    setLocale: (locale: string) => void
    setLocalePersistently: (locale: string) => void
}

const useLocaleStore = create<LocaleStoreState>((set, get) => ({
    locale: "",
    setLocale: (locale: string) => {
        return set({ locale })
    },
    setLocalePersistently: (locale: string) => {
        if (typeof window !== "undefined") {
            const rememberSeconds = 3600 * 24 * 365
            document.cookie = `NEXT_LOCALE=${encodeURIComponent(
                locale
            )}; path=/; max-age=${rememberSeconds}`
        }
        return get().setLocale(locale)
    },
}))

export default useLocaleStore
