module.exports = {
  env: { node: true, es2022: true },
  extends: ["eslint:recommended", "plugin:import/recommended", "prettier"],
  parserOptions: { ecmaVersion: 2022, sourceType: "script" },
  rules: {
    "import/no-unresolved": "off",
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }]
  }
};
