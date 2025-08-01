import { defineConfig } from 'vite';
import { ViteEjsPlugin } from 'vite-plugin-ejs';
import { visualizer } from 'rollup-plugin-visualizer';
import liveReload from 'vite-plugin-live-reload';
import { plugin as markdown, Mode } from 'vite-plugin-markdown';
import path from 'path';

/// <reference types="vitest" />

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  const analyze = mode === 'analyze';

  return {
    // Base URL for GitHub Pages deployment
    base: isProduction ? '/eel-rpg-game/' : '/',
    // Test configuration
    test: {
      globals: true,
      environment: 'node',
    },
    plugins: [
      ViteEjsPlugin({
        title: 'ElnalFTB - Turn-based RPG'
      }, {
        ejs: {
          views: [
            path.resolve(__dirname, 'src/templates/partials'),
            path.resolve(__dirname, 'src/templates/components')
          ],
          beautify: !isProduction
        }
      }),
      // Markdown plugin for document management
      markdown({
        mode: [Mode.MARKDOWN]
      }),
      // Live reload for EJS templates and Markdown documents (development only)
      ...(!isProduction ? [
        liveReload('src/templates/**/*.ejs'),
        liveReload('src/game/data/documents/**/*.md')
      ] : []),
      // Bundle analyzer (conditional)
      ...(analyze ? [visualizer({
        filename: 'dist/stats.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
      })] : []),
    ],
    
    // Path aliases
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@/game': path.resolve(__dirname, 'src/game'),
        '@/ui': path.resolve(__dirname, 'src/ui'),
        '@/data': path.resolve(__dirname, 'src/data'),
      },
    },

    // Define global constants
    define: {
      DEBUG: JSON.stringify(!isProduction),
    },

    // Development server configuration
    server: {
      port: 3000,
      host: true,
    },

    // Build configuration
    build: {
      outDir: 'dist',
      sourcemap: true,
      target: 'es2020',
      
      // Code splitting configuration
      rollupOptions: {
        output: {
          manualChunks: {
            // Boss data chunks - now handled automatically by glob import
            // Large scenes
            'chunk-scenes': [
              './src/game/scenes/BattleScene.ts',
            ],
            // Common utilities
            'chunk-utils': [
              './src/game/utils/CombatUtils.ts',
              './src/game/utils/ModalUtils.ts',
            ],
          },
        },
      },
      
      // Performance budgets (similar to webpack performance config)
      chunkSizeWarningLimit: 250, // 250 KiB
    },

    // Copy static files
    publicDir: 'src/public',
    
    // CSS configuration
    css: {
      devSourcemap: true,
    },

    // Preview server configuration
    preview: {
      port: 3000,
      open: true,
    },
  };
});