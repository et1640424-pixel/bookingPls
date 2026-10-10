import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Адрес Django-сервера. Поменяйте, если запускаете на другом порту.
const BACKEND = 'http://127.0.0.1:8000';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '^/en/': BACKEND, // API (в проекте i18n_patterns, поэтому префикс /en/)
      '/media': BACKEND, // фото отелей, номеров и аватары
    },
  },
});
