import { redirect } from 'react-router-dom'

export async function loader({ request }: { request: Request }) {
    const useUserState = await (await import('@/data/use-user-state')).default
    const { logout, loginPage } = useUserState.getState()
    const next = new URL(request.url).searchParams.get('next')
    await logout()
    return redirect(`${loginPage}?next=${next || ''}`)
}

export function Component() {
    return <></>
}
