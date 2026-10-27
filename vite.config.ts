import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { supermemoryApi } from './server/supermemory';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      tailwindcss(),
      react(),
      supermemoryApi(env.SUPERMEMORY_API_KEY),
    ],
    server: {
      port: 3000,
      open: false,
    },
  };
});
