import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/Nightmare-company/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        pedido: resolve(__dirname, 'pedido.html')
      }
    }
  }
});

