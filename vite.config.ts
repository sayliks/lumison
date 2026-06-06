import path from 'path';
import { defineConfig } from 'vitest/config';
import { type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

interface WebManifestIcon {
  src: string;
  [key: string]: unknown;
}

interface WebManifest {
  start_url?: string;
  icons?: WebManifestIcon[];
  [key: string]: unknown;
}

function manifestPlugin(base: string): Plugin {
  return {
    name: 'manifest-plugin',
    apply: 'build',
    closeBundle() {
      if (base === '/') return;

      const manifestPath = path.resolve(__dirname, 'dist/manifest.json');
      if (fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as WebManifest;

        manifest.start_url = base;
        manifest.icons = manifest.icons?.map((icon) => {
          const iconSrc = icon.src.startsWith('/') ? icon.src.slice(1) : icon.src;
          return {
            ...icon,
            src: base + iconSrc
          };
        }) ?? [];

        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
        console.log('✓ Updated manifest.json for static build');
      }
    }
  };
}

export default defineConfig(({ mode }) => {
  const isTauri = process.env.TAURI_ENV_PLATFORM !== undefined;
  const base = isTauri ? '/' : './';

  return {
    base,

    server: {
      port: isTauri ? 1420 : 3000,
      host: '0.0.0.0',
      strictPort: true,
    },

    plugins: [react(), manifestPlugin(base)],

    define: {
      '__TAURI__': isTauri,
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        'jsmediatags': path.resolve(__dirname, 'src/vendor/jsmediatags-shim.js'),
      },
    },

    optimizeDeps: {
      exclude: ['jsmediatags'],
    },

    test: {
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.claude/**',
        '**/src-tauri/target/**',
        '**/src-tauri/gen/**',
      ],
    },

    build: {
      target: isTauri ? 'esnext' : 'es2015',
      minify: mode === 'production',
      sourcemap: mode === 'development',
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) {
              return;
            }

            if (id.includes('react') || id.includes('scheduler')) {
              return 'react-vendor';
            }

            if (id.includes('@tauri-apps')) {
              return 'tauri-vendor';
            }

            if (id.includes('@react-spring')) {
              return 'animation-vendor';
            }

            if (id.includes('jsmediatags')) {
              return 'media-tags-vendor';
            }

            if (id.includes('colorthief')) {
              return 'image-vendor';
            }

            return 'vendor';
          },
        },
      },
    },
  };
});
