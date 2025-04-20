const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    frontend: './src/frontend/src/index.jsx',
    mobile: './src/mobile/index.jsx'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
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
      template: './src/frontend/public/index.html',
      filename: 'index.html',
      chunks: ['frontend']
    }),
    new HtmlWebpackPlugin({
      template: './src/mobile/public/index.html',
      filename: 'mobile.html',
      chunks: ['mobile']
    }),
    new webpack.DefinePlugin({
      // NODE_ENV はVercelが設定するものを優先し、ここでは設定しない
      'process.env.REACT_APP_API_URL': JSON.stringify(process.env.REACT_APP_API_URL || 'MISSING_API_URL_IN_BUILD') 
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    hot: true,
    port: 3002,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        pathRewrite: { '^/api': '' }
      }
    }
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      name: 'vendor'
    }
  }
};
