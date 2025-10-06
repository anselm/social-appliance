// vite.config.js
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

function buildInfoPlugin() {
  return {
    name: 'build-info',
    config() {
      const buildDate = new Date().toISOString();
      const buildRevision = Date.now().toString(36);
      return {
        define: {
          __BUILD_DATE__: JSON.stringify(buildDate),
          __BUILD_REVISION__: JSON.stringify(buildRevision),
        }
      };
    }
  };
}

export default defineConfig({

  plugins: [
    buildInfoPlugin(),
    svelte({ preprocess: vitePreprocess() }),
  ],

  server: {
    port: 8000,
    proxy: {
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true
      }
    }
  },

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['svelte', 'svelte-routing']
        }
      }
    },
    dynamicImportVarsOptions: {
      exclude: [/\.info\.js$/]
    }
  }
});
