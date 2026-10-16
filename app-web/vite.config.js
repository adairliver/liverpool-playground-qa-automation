import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Puerto fijo por defecto: la suite de automatizacion apunta a http://localhost:5199.
// El evaluador puede levantar otra instancia en paralelo con PORT=5299 (ver evaluador/progreso.sh).
const port = Number(process.env.PORT) || 5199;

export default defineConfig({
  plugins: [react()],
  server: { host: '0.0.0.0', port, strictPort: true },
  preview: { host: '0.0.0.0', port, strictPort: true },
});
