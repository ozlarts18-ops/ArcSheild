import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

import fs from 'fs';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  // Load environment variables from root .env if present, otherwise local client dir
  envDir: fs.existsSync('../.env') ? '../' : './',
  // Expose ONLY variables prefixed with VITE_ to client bundle
  envPrefix: 'VITE_',
  server: {
    port: 3000
  }
});
