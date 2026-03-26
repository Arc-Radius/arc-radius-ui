const path = require('path');

module.exports = function (api) {
  api.cache(true);

  /** Matches tsconfig `paths`: `@/*` -> project root (Metro needs this; TS alone is not enough). */
  const plugins = [
    [
      'module-resolver',
      {
        root: [path.resolve(__dirname)],
        alias: {
          '@': path.resolve(__dirname),
        },
        extensions: ['.ios.js', '.android.js', '.js', '.jsx', '.json', '.tsx', '.ts'],
      },
    ],
    'react-native-worklets/plugin',
  ];

  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],

    plugins,
  };
};
