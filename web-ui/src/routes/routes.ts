// render index.html for those urls
import type { PluginOption } from "vite"

const routes = [
    "/",
    "/login",
    "/logout",
    "/certificate/create"
]

export default routes

/**
 * Rollup Plugin to generate routes.json in /public dir
 * @returns 
 */
export function generateReactRoutes(): PluginOption {
    return {
        name: 'generate-react-routes',
        generateBundle() {
            this.emitFile({
                type: 'asset',
                fileName: 'routes.json',
                source: JSON.stringify(routes)
            })
        },
    }
}
