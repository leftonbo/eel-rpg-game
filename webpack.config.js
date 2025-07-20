import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import webpack from 'webpack';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: './src/main.ts',
    output: {
      filename: 'bundle.js',
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
    plugins: [
      new webpack.DefinePlugin({
        DEBUG: JSON.stringify(!isProduction),
      }),
      new HtmlWebpackPlugin({
        template: './src/index.html',
        title: 'Eel Feed - Turn-based RPG',
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: './src/robots.txt',
            to: 'robots.txt'
          }
        ]
      }),
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