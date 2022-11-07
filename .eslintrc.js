/** @type {import('eslint').Linter.Config} */
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      modules: true,
    },
  },
  plugins: [
    'typescript-sort-keys',
    'unused-imports',
    'simple-import-sort',
    '@typescript-eslint',
  ],
  env: {
    es6: true,
    node: true,
    // jest: true,
  },
  extends: [
    'eslint:recommended',
    'prettier',
    'plugin:prettier/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    'unused-imports/no-unused-imports': 'error',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'typescript-sort-keys/interface': 'error',
    'typescript-sort-keys/string-enum': 'error',

    'no-debugger': 'error',

    '@typescript-eslint/no-var-requires': 'off',
  },
  settings: {
    // '@typescript-eslint/camelcase': [
    //   'error',
    //   { allow: ['__non_webpack_module__', '__non_webpack_require__', '^npm(_[a-z]+)+$'] },
    // ],
    // '@typescript-eslint/class-name-casing': 2,
    // '@typescript-eslint/indent': ['error', 2, { SwitchCase: 1 }],
    // '@typescript-eslint/no-unused-vars': [2, { args: 'none', ignoreRestSiblings: true }],
    // 'array-bracket-spacing': 2,
    // 'arrow-spacing': 2,
    // 'comma-dangle': ['error', 'always-multiline'],
    // 'computed-property-spacing': 2,
    // 'generator-star-spacing': ['error', { before: true, after: true }],
    // 'keyword-spacing': 2,
    // 'no-multiple-empty-lines': 2,
    // 'no-tabs': 2,
    // 'no-trailing-spaces': 2,
    // 'no-unused-vars': 'off',
    // 'object-curly-spacing': 2,
    // 'padded-blocks': ['error', 'never'],
    // 'prefer-template': 2,
    // 'rest-spread-spacing': 2,
    // 'template-curly-spacing': 2,
  },
};
