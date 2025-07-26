import { defineConfig } from 'vite';
import { ViteEjsPlugin } from 'vite-plugin-ejs';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  const analyze = mode === 'analyze';

  return {
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
      open: true,
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
            // Boss data chunks
            'chunk-bosses': [
              './src/game/data/bosses/swamp-dragon.ts',
              './src/game/data/bosses/dark-ghost.ts',
              './src/game/data/bosses/mech-spider.ts',
              './src/game/data/bosses/scorpion-carrier.ts',
              './src/game/data/bosses/sea-kraken.ts',
              './src/game/data/bosses/aqua-serpent.ts',
              './src/game/data/bosses/dream-demon.ts',
              './src/game/data/bosses/mikan-dragon.ts',
              './src/game/data/bosses/clean-master.ts',
              './src/game/data/bosses/bat-vampire.ts',
              './src/game/data/bosses/underground-worm.ts',
            ],
            // Large scenes
            'chunk-scenes': [
              './src/game/scenes/BattleScene.ts',
              './src/game/scenes/BossSelectScene.ts',
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