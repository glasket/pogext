const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    main: './pog.js',
    background: './background.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            booleans_as_integers: true,
            drop_console: true,
            drop_debugger: true,
            ecma: 2015,
            keep_fargs: false,
          },
          mangle: true,
        },
      }),
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: path.join(__dirname, 'images/128.png'), to: 'images/128.png' },
        { from: path.join(__dirname, 'manifest.json'), to: 'manifest.json' },
      ],
    }),
  ],
};
