import { create } from "zustand"

interface UserState {
    workspaceId: number;
    name: string;
    isLoggedIn: boolean;
    loginPage: string;
    setLoginState: (res: UserStateResponse) => void;
    setLogout: () => void;
}

interface UserStateResponse {
    workspaceId: number;
    name: string;
}

const defaultState = {
    workspaceId: 0,
    isLoggedIn: false,
    name: "",
    loginPage: "/login",
}

const useUserState = create<UserState>((set) => {
    return {
        ...defaultState,
        setLoginState: (response) => {
            set({
                isLoggedIn: true,
                workspaceId: response.workspaceId,
                name: response.name,
            })
        },
        setLogout: () => {
            set({
                ...defaultState,
            })
        },
    }
})

export default useUserState
