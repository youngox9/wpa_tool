const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ChromeExtensionReloader = require('webpack-chrome-extension-reloader');

const SRC = path.join(__dirname, 'src');

const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
  template: `${SRC}/popup.html`,
  inject: true,
  filename: 'popup.html',
  chunks: ['popup']
});

module.exports = {
  entry: {
    popup: `${SRC}/popup.js`,
    background: `${SRC}/background.js`,
    content: `${SRC}/content.js`
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        include: path.resolve(__dirname, 'src'),
        use: ['babel-loader'],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
          {
            loader: 'less-loader',
            options: {
              javascriptEnabled: true
            }
          }
        ]
      },
      {
        test: /\.(sass|scss)$/,
        use: ['css-loader', 'sass-loader']
      },
      {
        test: /\.(png|jpg|gif|mp4|ogg|svg|woff|woff2|ttf|eot)$/,
        loader: 'file-loader'
      }
    ]
  },
  stats: {
    children: false,
    chunks: false,
    chunkModules: false,
    chunkOrigins: false,
    modules: false
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: `${SRC}/manifest.json` },
      // { from: `${SRC}/data.json` },
      { context: `${SRC}/assets`, from: 'icon-**', to: 'assets' }
    ]),
    HtmlWebpackPluginConfig,
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery'
    }),
    // new ChromeExtensionReloader({
    //   port: 9090,
    //   reloadPage: true,
    //   entries: { // The entries used for the content/background scripts
    //     contentScript: 'content-script',
    //     background: 'background',
    //     extensionPage: 'popup',
    //   }
    // })
  ],
  resolve: {
    extensions: ['.js', '.jsx']
  }
};
