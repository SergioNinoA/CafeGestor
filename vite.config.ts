import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carga las variables de entorno
  // El tercer argumento '' permite cargar todas las variables del sistema
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false
    },
    define: {
      // Define process.env como objeto vacío para evitar errores "process is not defined" en navegador
      'process.env': {},
      // Inyecta la API KEY de forma segura. Si no existe, usa string vacío.
      'process.env.API_KEY': JSON.stringify(env.API_KEY || '')
    }
  };
});