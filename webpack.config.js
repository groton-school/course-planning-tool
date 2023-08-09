const fs = require('fs');
const webpack = require('webpack');

process.env.APP_VERSION = JSON.parse(fs.readFileSync('package.json')).version;

module.exports = require('@battis/gas-lighter/webpack.config')({
  root: __dirname,
  plugins: [
    new webpack.DefinePlugin({
      APP_VERSION: JSON.stringify(process.env.APP_VERSION)
    })
  ]
  // production: false
});
