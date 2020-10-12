/* eslint-disable @typescript-eslint/quotes */
/*/////////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  This configuration defines the webpack rules for processing different file
  types in our modular javascript code. It is a base configuration that is
  shared with the packaging and distribution configurations.

  Specifically, it allows us to import/require different kinds of files in our
  source code. Webpack uses these rules to transform the code on-the-fly.

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * ///////////////////////////////////*/

/// LOAD LIBRARIES ////////////////////////////////////////////////////////////
const Path = require('path');

/// LOAD LOCAL MODULES ////////////////////////////////////////////////////////
const URSERV = require('@gemstep/ursys/server');

/// DEBUG INFO ////////////////////////////////////////////////////////////////
const PR = URSERV.PrefixUtil(' PACK/RSV');

/// CONSTANTS INFO ////////////////////////////////////////////////////////////
const DIR_ROOT = Path.resolve(__dirname, '../');
// Any directories you will be adding code/files into
// For an Electron-binary debug server using webpack middleware, you may need
// to add the additional paths where the built files are located
const DIR_INCLUDES = [Path.join(DIR_ROOT, 'src')];

/// MODULE EXPORT /////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const WebpackLoaders = () => {
  console.log(...PR('... setting common webpack loader rules'));
  return {
    module: {
      rules: [
        // OPTION 1: use Babel to handle JS and TS
        // .babelrc adds @babel/preset-typescript to make possible
        {
          test: /\.(jsx?|tsx?)$/,
          loader: 'babel-loader',
          include: DIR_INCLUDES,
          // don't process js/jsx in node_modules
          exclude: /node_modules/
        },
        // OPTION 2: use ts-loader to handle JS and TS
        // broken: compiles but bootstrap doesn't start the code
        // {
        //   test: /\.(tsx?|jsx?)$/,
        //   loader: 'ts-loader',
        //   include: DIR_INCLUDES,
        //   // don't process ts/tsx in node_modules
        //   exclude: /node_modules/
        // }

        {
          test: /\.css$/,
          include: DIR_INCLUDES,
          use: [{ loader: 'style-loader' }, { loader: 'css-loader' }]
          // some static css is in node_modules, so don't exclude it
        },
        {
          // allegedly create unified source maps from output .js files from everyone
          // including libraries with their own source maps (?)
          // this loader runs after all js files are produced (?)
          enforce: 'pre', // webpack.js.org/configuration/module/#ruleenforce
          test: /\.js$/,
          include: DIR_INCLUDES,
          loader: 'source-map-loader'
        },
        {
          test: /\.(jpe?g|png|gif)$/,
          use: [{ loader: 'file-loader?name=img/[name]__[hash:base64:5].[ext]' }],
          // note: applies only to "imported" images in source code. Doesn't affect
          // static assets copied as-is (see wp.pack.* configs)
          include: DIR_INCLUDES
        },
        {
          test: /\.(eot|svg|ttf|woff|woff2)$/,
          use: [
            { loader: 'file-loader?name=font/[name]__[hash:base64:5].[ext]' }
          ],
          // note: applies only to "imported" images in source code. Doesn't affect
          // static assets copied as-is (see wp.pack.* configs)
          include: DIR_INCLUDES
        }
      ]
    },
    resolve: {
      // make require() handle both .js and .jsx files (default only .js)
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      // create webapp path aliases for module imports
      // for visual studio code live linting, update eslintrc
      alias: {
        config: Path.resolve(__dirname, '../config'),
        app: Path.resolve(__dirname, '../src/app'),
        lib: Path.resolve(__dirname, '../src/app/lib'),
        modules: Path.resolve(__dirname, '../src/app/modules'),
        static: Path.resolve(__dirname, '../src/app/static')
        // ursys: Path.resolve(__dirname, '../ursys'),
        // util: Path.resolve(__dirname, '../src/util'),
        // step: Path.resolve(__dirname, '../src/step/'),
      }
    }
  };
};

/// EXPORT CONFIGURATION //////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// merges the base loaders with additional webapp-specific config parameters
module.exports = WebpackLoaders;
