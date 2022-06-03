const path = require('path');
const autoprefixer = require('autoprefixer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const env = process.env.NODE_ENV || 'development'
const isDev = env !== 'production';
const styleLoader = {
  loader: isDev ? 'style-loader' : MiniCssExtractPlugin.loader
};
const cssModuleLoader = {
  loader: 'css-loader',
  options: {
    sourceMap: isDev,
    modules: true
  }
};
const cssGlobalLoader = {
  loader: 'css-loader',
  options: {
    modules: 'global'
  }
};
const postcssLoader = {
  loader: 'postcss-loader',
  options: {
    postcssOptions: {
      plugins: [
        autoprefixer()
      ]
    }
  }
};
const sassLoader = {
  loader: 'sass-loader',
  options: {
    sourceMap: isDev
  }
}

module.exports = {
  entry: './src/index.js',
  mode: env,
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'static/js/main.[fullhash:8].js',
    chunkFilename: 'static/js/main.[fullhash:8].js',
    publicPath: ''
  },
  devServer: {
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: {
          host: 'localhost',
          protocol: 'http:',
          port: 12321
        }
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/i,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.module\.scss$/i,
        exclude: /node_modules/,
        use: [
          styleLoader,
          cssModuleLoader,
          postcssLoader,
          sassLoader
        ]
      },
      {
        test: /\.scss$/i,
        exclude: /(node_modules)|(\.module)/,
        use: [
          styleLoader,
          cssGlobalLoader,
          postcssLoader,
          sassLoader
        ]
      },
      {
        test: /\.module\.css$/i,
        exclude: /node_modules/,
        use: [
          styleLoader,
          cssModuleLoader,
          postcssLoader
        ]
      },
      {
        test: /\.css$/i,
        exclude: /(node_modules)|(\.module\.css$)/,
        use: [
          styleLoader,
          cssGlobalLoader,
          postcssLoader
        ]
      },
      {
        test: /\.(bmp|gif|jpg|jpeg|png)$/i,
        exclude: /node_modules/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000,
              name: 'static/media/[name].[hash:8].[ext]'
            }
          }
        ]
      },
      {
        exclude: /(node_modules)|(\.(js|jsx|html|scss|css|svg)$)/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              limit: 10000,
              name: 'static/media/[name].[fullhash:8].[ext]'
            }
          }
        ]
      },
      {
        test: /\.svg$/,
        issuer: /\.[jt]sx?$/,
        use: [
          {
            loader: '@svgr/webpack',
            options: {
              icon: true
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: __dirname + '/public/index.html',
      filename: 'index.html'
    })
  ].concat([new MiniCssExtractPlugin({
    filename: 'static/stylesheets/[name].[fullhash:8].css',
    chunkFilename: 'static/stylesheets/[name].[fullhash:8].css'
  })])
};
