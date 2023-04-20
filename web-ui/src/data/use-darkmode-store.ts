import { create } from "zustand"

interface DarkmodeStoreState {
    isDarkmode: boolean
    setDarkmode: (isDarkmode: boolean) => void
}
const isDarkmode = window.matchMedia('(prefers-color-scheme: dark)').matches
const toggleDarkmodeClass = (isDarkmode: boolean) => {
    if (isDarkmode) {
        document.documentElement.classList.add('dark')
    } else {
        document.documentElement.classList.remove('dark')
    }
}

const useDarkmodeStore = create<DarkmodeStoreState>((set) => ({
    isDarkmode,
    setDarkmode: (isDarkmode) => {
        toggleDarkmodeClass(isDarkmode)
        set({
            isDarkmode
        })
    }
}))
export default useDarkmodeStore
