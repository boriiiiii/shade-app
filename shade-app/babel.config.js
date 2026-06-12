module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        "babel-preset-expo",
        {
          jsxImportSource: "nativewind",
          // Requis car valtio (dépendance de WalletConnect) utilise `import.meta`,
          // non supporté nativement par Hermes (moteur JS de React Native).
          unstable_transformImportMeta: true,
        },
      ],
      "nativewind/babel",
    ],
  };
};
