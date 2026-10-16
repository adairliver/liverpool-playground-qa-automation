import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Puerto por defecto: la suite de automatizacion apunta a http://localhost:5199.
// Se puede cambiar con la variable de entorno PORT.
const port = Number(process.env.PORT) || 5199;

export default defineConfig({
  plugins: [react()],
  server: { host: '0.0.0.0', port, strictPort: true },
  preview: { host: '0.0.0.0', port, strictPort: true },
});
