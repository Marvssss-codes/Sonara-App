// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Ensure CommonJS files are resolvable
config.resolver.sourceExts = [
  "tsx",
  "ts",
  "jsx",
  "js",
  "cjs",
  "json"
];

module.exports = config;
