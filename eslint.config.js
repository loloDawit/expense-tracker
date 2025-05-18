// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierPlugin = require('eslint-plugin-prettier');

module.exports = defineConfig([
  expoConfig,
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error', // Show Prettier formatting issues as ESLint errors
    },
  },
  {
    ignores: ['dist/*'],
  },
]);
