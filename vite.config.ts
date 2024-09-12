import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import { autoComplete, Plugin as importToCDN } from "vite-plugin-cdn-import";
import { fileURLToPath, URL } from "node:url";
// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;
import path from "path";
// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [vue(), AutoImport({
    resolvers: [ElementPlusResolver()],
  }),
  Components({
    resolvers: [ElementPlusResolver()],
  }),],
  resolve: {
    alias: {
      "@": path.join(__dirname, "./src/"),
    },
    // alias: {

    //   "@": fileURLToPath(new URL("./src", import.meta.url)),
    // },
  },
  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
        protocol: "ws",
        host,
        port: 1421,
      }
      : undefined,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
