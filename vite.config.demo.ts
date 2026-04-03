import { defineConfig } from "vite";
import { resolve } from "path";
import packageJson from "./package.json";

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
  // Set base to the repository name for GitHub Pages compatibility
  // If this is a user/org page (e.g. gnuton.github.io), set base to '/'
  base: './',
  build: {
    outDir: 'dist-demo',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  server: {
    port: 3001,
  },
});
