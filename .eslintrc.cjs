// .eslintrc.cjs

module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "@typescript-eslint/parser",
  },
  extends: [
    "@nuxtjs/eslint-config-typescript",
    "plugin:prettier/recommended",
    "plugin:storybook/recommended",
  ],
  plugins: [],
  rules: {
    "no-console": ["error", { allow: ["error", "warn"] }],
    "no-new": "off",
    "vue/no-multiple-template-root": "off",
    "vue/no-v-html": "off",
    "vue/valid-template-root": "off",
  },
};
