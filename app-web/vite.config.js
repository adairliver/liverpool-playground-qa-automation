import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Puerto fijo: la suite de automatizacion apunta a http://localhost:5199
export default defineConfig({
  plugins: [react()],
  server: { host: '0.0.0.0', port: 5199, strictPort: true },
  preview: { host: '0.0.0.0', port: 5199, strictPort: true },
});
