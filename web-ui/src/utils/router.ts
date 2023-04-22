import { LazyRouteFunction, LoaderFunction, useLoaderData } from 'react-router-dom'

/**
 * add types for userLoaderData
 * @link https://github.com/remix-run/react-router/discussions/9792#discussioncomment-5211654
 * @param loaderFn 
 * @returns 
 */
export function useDataFromLoader<LoaderFn extends LoaderFunction>(loaderFn: LoaderFn) {
    return useLoaderData() as Awaited<ReturnType<typeof loaderFn>>
}

export function lazy(path: string) {
    const module = import('@/pages/index')
    return module
}
