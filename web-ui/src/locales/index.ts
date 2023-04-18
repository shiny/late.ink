
import langEn from "@/locales/en.json"
import langZhCN from "@/locales/zh-CN.json"

class Locales {

    static languages = [
        {
            locale: 'en',
            name: 'English',
            messages: langEn
        },
        {
            locale: 'zh-CN',
            name: '中文（简体）',
            messages: langZhCN
        }
    ]

    static get (locale: string, key: "messages"): typeof Locales.languages[number]["messages"]
    static get (locale: string, key: "locale"): typeof Locales.languages[number]["locale"]
    static get (locale: string, key: "name"): typeof Locales.languages[number]["name"]
    static get(locale: typeof Locales.languages[number]["locale"], key: keyof typeof Locales.languages[number]) {
        const lang = Locales.languages.find(item => item.locale === locale)
        if (!lang) {
            throw new Error(`Language ${lang} not found`)
        }
        return lang[key]
    }

    static getMessages(locale: typeof Locales.languages[number]["locale"]): typeof Locales.languages[number]["messages"] {
        return Locales.get(locale, 'messages')
    }

    static getLocale(locale: typeof Locales.languages[number]["locale"]) {
        return Locales.get(locale, 'locale')
    }

    static getLanguage(locale: typeof Locales.languages[number]["locale"]) {
        return Locales.get(locale, 'name')
    }

    static getCurrentLocale (locale?: string, defaultLocale?: string, fallbackLocale = 'en') {
        if (locale) {
            return locale
        }
        if (!defaultLocale || defaultLocale === 'default') {
            return fallbackLocale
        } else {
            return defaultLocale
        }
    }
}
export default Locales

