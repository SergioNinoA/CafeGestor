import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carga las variables de entorno basándose en el modo actual (development/production)
  // El tercer argumento '' permite cargar todas las variables, no solo las que empiezan por VITE_
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false
    },
    define: {
      // Esto reemplaza process.env.API_KEY en el código del cliente con el valor real
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});