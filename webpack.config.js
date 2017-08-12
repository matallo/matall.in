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
      "waypoints",
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
  resolve: {
    modules: ["bower_components", "node_modules"],
    alias: {
      "waypoints": path.join(__dirname, "bower_components/waypoints/lib/noframework.waypoints.js"),
    },
  },
  module: {
    rules: [
      {
        test: /\.js/,
        loader: "shim-loader",
        query: {
          shim: {
            "waypoints": {
              exports: "Waypoint"
            }
          }
        },
        include: [path.join(__dirname, "bower_components")]
      }, {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }, {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          "eslint-loader"
        ]
      }, {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: [{
            loader: "css-loader", options: {
              sourceMap: true
            }
          }, {
            loader: "sass-loader", options: {
              sourceMap: true,
              outputStyle: "compressed"
            }
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
