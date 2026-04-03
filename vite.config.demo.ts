import { defineConfig } from 'vite';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  // Set base to the repository name for GitHub Pages compatibility
  // If this is a user/org page (e.g. gnuton.github.io), set base to '/'
  base: '/css-dice-roller/',
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
