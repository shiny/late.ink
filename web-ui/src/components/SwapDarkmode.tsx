import useDarkmodeStore from "@/data/use-darkmode-store"
import { IconSun, IconMoon } from "@/assets/Icons"

export default function SwapDarkmode() {
    const {
        isDarkmode,
        setDarkmode
    } = useDarkmodeStore()
    return <>
        <label className="swap swap-rotate hover:text-[--accent-color] transition">
            <input type="checkbox" checked={isDarkmode} onChange={el => setDarkmode(el.target.checked)} />
            <IconSun className="swap-off w-7 h-7" />
            <IconMoon className="swap-on w-7 h-7" />
        </label>
    </>
}