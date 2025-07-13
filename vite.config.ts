import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react-swc"
import { createHtmlPlugin } from "vite-plugin-html"
import path from "path"

const LOCAL_FOLDER_URL = "http://localhost:8000"
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const htmlPlugin: any[] = []

  if (mode === "development") {
    htmlPlugin.push(
      createHtmlPlugin({
        minify: true,
        entry: "/src/index.tsx",
        template: "index-local.html"
        // inject: {
        //   data: {
        //     envConfigJs: `${LOCAL_FOLDER_URL}/env-config.js?`
        //   }
        // }
      })
    )
  } else {
    htmlPlugin.push(
      createHtmlPlugin({
        pages: [
          {
            entry: "/src/index.tsx",
            template: "index.html",
            filename: "index.html"
            // injectOptions: {
            //   data: {
            //     envConfigJs: `${DEV_FOLDER_URL}/env-config.min.js?${version}`
            //   }
            // }
          }
        ]
      })
    )
  }

  return {
    define: { "process.env": JSON.stringify(env) },
    base: "/",
    plugins: [react(), htmlPlugin],
    css: {
      modules: {
        scopeBehaviour: "local"
      }
    },
    build: {
      sourcemap: mode === "development",
      rollupOptions: {
        output: {
          manualChunks: undefined
        }
      }
    },
    test: {
      globals: true,
      environment: "jsdom"
    },
    server: {
      port: 8000
    },
    preview: {
      port: 8000
    },
    resolve: {
      alias: {
        components: path.resolve(__dirname, "./src/components"),
        constants: path.resolve(__dirname, "./src/constants"),
        css: path.resolve(__dirname, "./src/css"),
        views: path.resolve(__dirname, "./src/views"),
        react: path.resolve(__dirname, "./node_modules/react"),
        "react-dom": path.resolve(__dirname, "./node_modules/react-dom")
      }
    },
    // Include these polyfills
    optimizeDeps: {
      include: ["core-js", "regenerator-runtime"]
    }
  }
})
