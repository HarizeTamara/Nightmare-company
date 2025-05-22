import { defineConfig } from 'vite';

export default defineConfig({
  base: './',  // importante se for usar em GitHub Pages ou pasta específica
  build: {
    outDir: 'dist',  // saída do build
  },
  server: {
    open: true, // abre o navegador automaticamente
  }
});
