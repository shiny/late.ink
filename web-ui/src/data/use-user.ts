import useLocaleStore from "@/data/use-locale-store"
import useUserState from "./use-user-state"

const fetcher = async (url: string) => {
    const res = await fetch(`http://127.0.0.1:3333${url}`, {
        credentials: "include",
    })
    return await res.json()
}

const poster = async (url: string, data = {}) => {
    const locale = useLocaleStore.getState().locale
    const res = await fetch(`http://127.0.0.1:3333${url}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept-Language": locale,
        },
        body: JSON.stringify(data),
        credentials: "include",
    })
    return await res.json()
}

export interface User {
    name: string;
    password: string;
}

export async function postLogin(user: User) {
    const res = await poster("/api/v1/user/login", user)
    console.log(res)
    return {
        errors: res.errors ?? [],
        success: res.success ?? false,
    }
}

export async function fetchLoginState() {
    const { name, workspaceId } = await fetcher("/api/v1/user/state")

    useUserState.getState().setLoginState({
        name,
        workspaceId,
    })
}
