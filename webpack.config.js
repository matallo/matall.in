const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const path = require('path');

module.exports = {
  entry: {
    app: ['./app/_js/index.js', './app/_scss/main.scss'],
    story: ['./app/_js/story.js'],
    html5shiv: ['html5shiv'],
    polyfills: [
      'picturefill',
      'smoothscroll',
      'lazysizes',
    ],
    vendor: [
      './app/_js/vendor/widgets.js',
      './app/_js/vendor/ei.js',
      './app/_js/vendor/analytics.js',
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
          loader: MiniCssExtractPlugin.loader,
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
