const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const path = require("path");

module.exports = {
  entry: {
    app: ["./app/_js/index.js", "./app/_scss/main.scss"],
    html5shiv: ["html5shiv"],
    vendor: [
      "picturefill",
      "smoothscroll",
      "d3-geo",
      "d3-selection",
      "topojson"
    ]
  },
  output: {
    filename: "js/[name].js",
    path: path.join(__dirname, "dist/"),
    publicPath: "/"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }, {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: [{
            loader: "css-loader", options: { sourceMap: true }
          }, {
            loader: "postcss-loader", options: { sourceMap: true }
          }, {
            loader: "sass-loader", options: { sourceMap: true }
          }]
        })
      }
    ]
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      filename: "js/[name].js",
      minChunks: Infinity
    }),
    new ExtractTextPlugin({
      filename: "css/main.css"
    })
  ]
};
