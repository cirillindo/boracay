import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  optimizeDeps: {
    include: [
      'three',
      'react-hook-form',
      'react-dropzone',
      'react-leaflet',
      'leaflet',
      'react-select',
      'axios',
      'react-datepicker',
      'date-fns',
    ]
  },
  build: {
    rollupOptions: {
      output: {
        inlineDynamicImports: false,
      },
    },
  },
});
