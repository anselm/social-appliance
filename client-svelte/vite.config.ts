import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

// Generate build info at build time
function buildInfoPlugin() {
  return {
    name: 'build-info',
    config() {
      const buildDate = new Date().toISOString()
      const buildRevision = Date.now().toString(36)
      
      return {
        define: {
          __BUILD_DATE__: JSON.stringify(buildDate),
          __BUILD_REVISION__: JSON.stringify(buildRevision)
        }
      }
    }
  }
}

export default defineConfig({
  plugins: [
    buildInfoPlugin(),
    svelte({
      preprocess: vitePreprocess()
    })
  ],
  server: {
    port: 8000,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
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
    // Tell Vite to ignore dynamic imports with specific patterns
    dynamicImportVarsOptions: {
      exclude: [/\.info\.js$/]
    }
  }
})
