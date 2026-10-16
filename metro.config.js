const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Tambahkan ekstensi wasm
config.resolver.assetExts.push('wasm');

// Konfigurasi tambahan untuk menangani worker dan modul web expo-sqlite
config.resolver.sourceExts.push('mjs', 'cjs');

module.exports = config;
