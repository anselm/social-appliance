// vite.config.js
import { defineConfig, loadEnv } from 'vite';
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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      buildInfoPlugin(),
      svelte({ 
        preprocess: vitePreprocess(),
        hot: false,
        emitCss: true
      }),
    ],

    server: {
      port: parseInt(env.CLIENTPORT || '8000'),
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || `http://localhost:${env.PORT || '8080'}`,
          changeOrigin: true
        }
      },
      hmr: false,
      // SPA fallback - serve index.html for all routes
      historyApiFallback: {
        rewrites: [
          { from: /^\/api\/.*$/, to: context => context.parsedUrl.path },
          { from: /./, to: '/index.html' }
        ]
      }
    },

    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['svelte']
          }
        }
      },
      dynamicImportVarsOptions: {
        exclude: [/\.info\.js$/]
      }
    },

    resolve: {
      conditions: ['browser', 'default']
    },

    optimizeDeps: {
      exclude: ['svelte']
    }
  };
});
