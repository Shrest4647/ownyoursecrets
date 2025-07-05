module.exports = function (api) {
  api.cache(true);
  const plugins = [];

  plugins.push("react-native-reanimated/plugin");

  return {
    presets: [
      [
        "babel-preset-expo",
        {
          unstable_transformImportMeta: true,
          jsxImportSource: "nativewind",
        },
      ],
      "nativewind/babel",
    ],
    plugins,
  };
};
