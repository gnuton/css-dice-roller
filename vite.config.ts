import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { defineConfig } from 'vitest/config';
import dts from 'vite-plugin-dts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'DiceRoller',
      fileName: 'css-dice-roller',
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
      },
    },
  },
  plugins: [dts({ insertTypesEntry: true })],
  server: {
    port: 3000,
    open: true,
  },
  test: {
    environment: 'happy-dom',
    globals: true,
  },
});
