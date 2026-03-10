// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = config;

// // metro.config.js
// const { getDefaultConfig } = require('expo/metro-config');

// module.exports = (async () => {
//   const config = await getDefaultConfig(__dirname);
//   config.transformer = {
//     ...config.transformer,
//     babelTransformerPath: require.resolve('react-native-reanimated/plugin'),
//   };
//   return config;
// })();
