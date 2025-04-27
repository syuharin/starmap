const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => { // Use function form to access mode
  const isProduction = argv.mode === 'production';

  return {
    entry: {
      app: './src/app/index.jsx', // Changed entry point
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? '[name].[contenthash].bundle.js' : '[name].bundle.js', // Add contenthash for production
      clean: true, // Clean dist folder before build
    },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/app/public/index.html', // Changed template path
      filename: 'index.html',
      chunks: ['app'] // Changed chunk name
    }),
    // Removed mobile HtmlWebpackPlugin
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(argv.mode), // Define NODE_ENV based on mode
      'process.env.REACT_APP_API_URL': JSON.stringify(process.env.REACT_APP_API_URL || (isProduction ? 'MISSING_API_URL_IN_BUILD' : 'http://localhost:8000')) // Provide default for dev
    })
  ],
  devtool: isProduction ? 'source-map' : 'eval-source-map', // Add source maps
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    hot: true,
    port: 3002, // Keep dev server port
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // Keep backend proxy
        pathRewrite: { '^/api': '' },
        secure: false,
        changeOrigin: true,
      }
    },
    historyApiFallback: true, // For single-page applications
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    }
  },
  performance: {
    hints: isProduction ? 'warning' : false // Show performance hints in production
  }
}};
