import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react-swc"
import eslint from "vite-plugin-eslint"
import path from "path"

const env = loadEnv('development', process.cwd(), '')
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), eslint()],
    build: {
        manifest: true,
        outDir: "../src/public",
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, './src')
        }
    },
    server: {
        proxy: {
            '/api': {
                target: env.API_ENDPOINT,
                changeOrigin: true
            },
        }
    }
})
