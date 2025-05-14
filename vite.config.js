import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
//import mkcert from 'vite-plugin-mkcert'
import basicSsl from '@vitejs/plugin-basic-ssl';
export default defineConfig({
  plugins: [react(),basicSsl()],
  //base: '/chuddforms/', 
  resolve: {
    alias: {
      '@': '/src',  // Ensures '@' maps to the 'src' directory
    },
  },
});
