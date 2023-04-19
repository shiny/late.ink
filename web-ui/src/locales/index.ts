import langEn from "@/locales/en.json"
import langZhCN from "@/locales/zh-CN.json"

class Locales {
    static languages = [
        {
            locale: "en",
            name: "English",
            messages: langEn,
        },
        {
            locale: "zh-CN",
            name: "中文（简体）",
            messages: langZhCN,
        },
    ]

    static get(
        locale: string,
        key: "messages"
    ): typeof Locales.languages[number]["messages"]
    static get(
        locale: string,
        key: "locale"
    ): typeof Locales.languages[number]["locale"]
    static get(
        locale: string,
        key: "name"
    ): typeof Locales.languages[number]["name"]
    static get(
        locale: typeof Locales.languages[number]["locale"],
        key: keyof typeof Locales.languages[number]
    ) {
        const lang = Locales.languages.find((item) => item.locale === locale)
        if (!lang) {
            throw new Error(`Language ${lang} not found`)
        }
        return lang[key]
    }

    static getMessages(
        locale: typeof Locales.languages[number]["locale"]
    ): typeof Locales.languages[number]["messages"] {
        return Locales.get(locale, "messages")
    }

    static getLocale(locale: typeof Locales.languages[number]["locale"]) {
        return Locales.get(locale, "locale")
    }

    static getLanguage(locale: typeof Locales.languages[number]["locale"]) {
        return Locales.get(locale, "name")
    }

}
export default Locales


export function getUserDefaultLanguage(fallbackLocale = 'en') {
    const supportedLocales = Locales.languages.map(item => item.locale)
    const userLanguage = window.navigator.language
    const userShortLanguage = window.navigator.language.split('-')[0]
    if (supportedLocales.includes(userLanguage)) {
        return userLanguage
    } else if (supportedLocales.includes(userShortLanguage)) {
        return userShortLanguage
    } else {
        return fallbackLocale
    }
}

const resources = {
    en: {
        translation: langEn,
    },
    "zh-CN": {
        translation: langZhCN,
    },
}

export { resources }
