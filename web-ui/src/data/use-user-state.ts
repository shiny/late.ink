import { create } from "zustand"
import { persist } from 'zustand/middleware'
import { fetch, post } from './request'

interface UserState {
    workspaceId: number
    name: string
    isLoggedIn?: boolean
    loginPage: string
    login: (user: User) => Promise<Response>
    logout: () =>Promise<void>
    syncLoginState: () => Promise<boolean>
    clear: () => void
}

interface UserStateResponse {
    workspaceId: number;
    name: string;
}

const defaultState = {
    workspaceId: 0,
    isLoggedIn: undefined,
    name: "",
    loginPage: "/login",
}

export interface User {
    name: string;
    password: string;
}

interface Response {
    errors?: { message: '' }[]
    success: boolean
}

export async function postLogin(user: User) {
    const res = await post("user/login", user)
    console.log(res)
    return {
        errors: res.errors ?? [],
        success: res.success ?? false,
    }
}

const useUserState = create(
    persist<UserState>(
        (set, get) => {
            return {
                ...defaultState,
                login: async (user: User) => {
                    const { errors, success } = await postLogin(user)
                    if (success) {
                        await get().syncLoginState()
                    }
                    return {
                        errors,
                        success
                    }
                },
                logout: async () => {
                    await fetch("user/logout")
                    get().clear()
                },
                syncLoginState: async () => {
                    try {
                        const { name, workspaceId }: UserStateResponse = await fetch("user/state", {
                            throwHttpErrors: true
                        })
                        set({
                            isLoggedIn: true,
                            name,
                            workspaceId
                        })
                        return true
                    } catch (err) {
                        console.error(err)
                        return false
                        // get().clear()
                    }
                },
                clear: () => {
                    console.log('clear')
                    set({
                        workspaceId: 0,
                        isLoggedIn: false,
                        name: "",
                        loginPage: "/login",
                    })
                }
            }
        }, {
            name: 'user-state'
        }))

export default useUserState
