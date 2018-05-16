const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const dev = process.env.NODE_ENV !== 'production';
const path = require('path');

module.exports = {
  entry: {
    app: ['./app/_js/index.js', './app/_scss/main.scss'],
    story: ['./app/_js/story.js'],
    html5shiv: ['html5shiv'],
    vendor: [
      'picturefill',
      'smoothscroll',
    ],
  },
  output: {
    filename: 'js/[name].js',
    path: path.resolve(__dirname, 'dist/'),
    publicPath: '/',
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true,
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      }, {
        test: /\.scss$/,
        use: [{
          loader: dev ? 'style-loader' : MiniCssExtractPlugin.loader,
        }, {
          loader: 'css-loader',
          options: {
            minimize: true,
            sourceMap: true,
          },
        }, {
          loader: 'postcss-loader', options: { sourceMap: true },
        }, {
          loader: 'sass-loader', options: { sourceMap: true },
        }],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
    }),
  ],
};
