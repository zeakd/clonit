module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  env: {
    es6: true,
    node: true,
  },
  rules: {
    'quotes': ['error', 'single'],
    'comma-dangle': ['error', 'always-multiline'],
    'eol-last': ['error', 'always'],
    'prefer-template': 'error',
    'object-curly-spacing': ['error', 'always'],
    'comma-spacing': ['error'],
    'semi': ['error', 'always'],
    'no-multi-spaces': ['error'],
    'no-unexpected-multiline': ['error'],
    'indent': ['error', 2],
    'object-curly-newline': ['error', { multiline: true }],
    'array-bracket-newline': ['error', { multiline: true }],
    'function-paren-newline': ['error', 'multiline'],
    'react/jsx-key': ['off'],
    'react/display-name': ['off'],
    'react/prop-types': ['off'],
    'react/function-component-definition': [
      'error', {
        'namedComponents': 'arrow-function',
        'unnamedComponents': 'arrow-function',
      },
    ],
    '@typescript-eslint/explicit-function-return-type': 'off',
  },
  settings: { react: { 'version': 'latest' } },
};
