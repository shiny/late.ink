import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import eslint from "vite-plugin-eslint"
import path from "path"

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
    }
})
