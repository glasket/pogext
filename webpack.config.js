const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { writeFileSync, readFileSync, read } = require('fs');

const version = JSON.parse(readFileSync('package.json')).version;

module.exports = (env) => {
  const manifest = JSON.parse(readFileSync('manifest.template.json'));
  manifest.version = version;

  let folder;

  if (env.chrome) {
    folder = 'chrome';
    manifest.background = {
      service_worker: 'background.js',
    };
  } else if (env.firefox || env.debug) {
    folder = 'firefox';
    manifest.background = { scripts: ['background.js'] };
    manifest.browser_specific_settings = {
      gecko: {
        id: '{abbef430-891c-4b93-b8dd-548949a900bd}',
      },
    };
  } else if (env.monkey) {
    return buildTamperMonkey();
  } else {
    throw new Error('Unknown environment');
  }

  writeFileSync(`${folder}-manifest.json`, JSON.stringify(manifest));

  if (env.debug) {
    return {
      entry: {
        main: './src/main.js',
        background: './src/background.js',
      },
      output: {
        filename: '[name].js',
        path: path.resolve(__dirname, `dist/${folder}`),
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
  }

  return {
    entry: {
      main: './src/main.js',
      background: './src/background.js',
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

const tamperMonkeyHeader = `// ==UserScript==
// @name         Actual PogChamp
// @namespace    pog
// @version      ${version}
// @description  Changes the PogChamp emote to the original Gootecks version.
// @author       Glasket
// @license      GPL-3.0; https://github.com/glasket/pogext/blob/master/LICENSE.md
// @match        *://*.twitch.tv/*
// @grant        window.onurlchange
// @run-at       document-end
// @updateURL    https://glasket.com/pog.user.js
// @downloadURL  https://glasket.com/pog.user.js
// @icon         https://raw.githubusercontent.com/glasket/pogext/master/images/128.png
// ==/UserScript==\n`;

const buildTamperMonkey = () => ({
  entry: './monkey/tampermonkey.js',
  output: {
    filename: 'pog.user.js',
    path: path.resolve(__dirname, 'dist'),
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
          mangle: true,
          format: {
            preamble: tamperMonkeyHeader,
          },
        },
      }),
    ],
  },
});
