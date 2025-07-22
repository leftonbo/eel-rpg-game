import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import webpack from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (env, argv) => {
  const isProduction = argv.mode === 'production';
  const analyze = env && env.analyze;
  
  return {
    entry: './src/main.ts',
    output: {
      filename: isProduction ? '[name].[contenthash].js' : '[name].js',
      chunkFilename: isProduction ? '[name].[contenthash].chunk.js' : '[name].chunk.js',
      path: path.resolve(__dirname, 'dist'),
      clean: true,
      publicPath: process.env.NODE_ENV === 'production' ? '/eel-rpg-game/' : '/',
    },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@/game': path.resolve(__dirname, 'src/game'),
      '@/ui': path.resolve(__dirname, 'src/ui'),
      '@/data': path.resolve(__dirname, 'src/data'),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // Boss data chunks - each boss will be its own chunk when dynamically imported
        bosses: {
          test: /[\\/]bosses[\\/]/,
          name: 'bosses',
          chunks: 'async',
          priority: 10,
        },
        // Large components
        scenes: {
          test: /[\\/]scenes[\\/](BattleScene|BossSelectScene)\.ts$/,
          name: 'large-scenes',
          chunks: 'async',
          priority: 20,
        },
        // Common utilities
        utils: {
          test: /[\\/]utils[\\/]/,
          name: 'utils',
          chunks: 'all',
          priority: 5,
        },
        // Default vendor chunk for node_modules (though we don't have any dependencies)
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all',
          priority: 30,
        },
      },
    },
    // Enable tree shaking
    usedExports: true,
    sideEffects: false,
  },
  performance: {
    maxEntrypointSize: 250000, // 244 KiB in bytes
    maxAssetSize: 250000,
    hints: isProduction ? 'error' : false, // Disable warnings in development
  },
    plugins: [
      new webpack.DefinePlugin({
        DEBUG: JSON.stringify(!isProduction),
      }),
      new HtmlWebpackPlugin({
        template: './src/index.html',
        title: 'ElnalFTB - Turn-based RPG',
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: './src/robots.txt',
            to: 'robots.txt'
          }
        ]
      }),
      // Conditionally add bundle analyzer
      ...(analyze ? [new BundleAnalyzerPlugin({
        analyzerMode: 'server',
        openAnalyzer: true,
        analyzerPort: 8888,
      })] : []),
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, 'dist'),
      },
      compress: true,
      port: 3000,
      open: true,
      hot: true,
    },
  };
};