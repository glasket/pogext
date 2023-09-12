const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { writeFileSync, readFileSync } = require('fs');

module.exports = (env) => {
  const manifest = JSON.parse(readFileSync('manifest.template.json'));

  let folder;

  if (env.chrome) {
    folder = 'chrome';
    manifest.background = {
      service_worker: 'background.js',
    };
  } else if (env.firefox) {
    folder = 'firefox';
    manifest.background = { scripts: ['background.js'] };
    manifest.browser_specific_settings = {
      gecko: {
        id: '{abbef430-891c-4b93-b8dd-548949a900bd}',
      },
    };
  } else {
    throw new Error('Unknown environment');
  }

  writeFileSync(`${folder}-manifest.json`, JSON.stringify(manifest));

  return {
    entry: {
      main: './pog.js',
      background: './background.js',
    },
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, `dist/${folder}`),
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
          {
            from: path.resolve(__dirname, 'images/128.png'),
            to: 'images/128.png',
          },
          {
            from: path.resolve(__dirname, `${folder}-manifest.json`),
            to: 'manifest.json',
          },
        ],
      }),
    ],
  };
};
