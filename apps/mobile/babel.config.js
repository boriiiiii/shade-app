// Babel config for Expo SDK 52 + NativeWind v4.
// - `jsxImportSource: "nativewind"` rewrites JSX so `className` works on RN core components.
// - `nativewind/babel` is a *preset* in v4 (not a plugin).
// - `react-native-reanimated/plugin` MUST stay last in the plugins array.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: ["react-native-reanimated/plugin"],
  };
};
