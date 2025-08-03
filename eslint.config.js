import pluginJs     from '@eslint/js';
import stylistic    from '@stylistic/eslint-plugin';
import arca         from 'eslint-plugin-arca';
import pluginImport from 'eslint-plugin-import';
import globals      from 'globals';
import tseslint     from 'typescript-eslint';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/dist/**',
      '**/out/**',
      '**/_/**',
    ],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
  },
  tseslint.configs.base,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  pluginJs.configs.recommended,
  stylistic.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      '@stylistic': stylistic,
      '@arca':      arca,
      '@import':    pluginImport,
    },
    rules: {
      // stylistic
      '@stylistic/member-delimiter-style': ['error', {
        multiline: {
          delimiter:   'semi',
          requireLast: true,
        },
        singleline: {
          delimiter:   'semi',
          requireLast: false,
        },
      }],
      '@stylistic/semi':                 ['error', 'always'],
      '@stylistic/indent':               ['error', 2],
      '@stylistic/quote-props':          ['error', 'as-needed'],
      '@stylistic/no-multi-spaces':      ['error', { exceptions: { ImportDeclaration: true, TSTypeAnnotation: true } }],
      '@stylistic/key-spacing':          ['error', { afterColon: true, beforeColon: false, align: 'value' }],
      '@stylistic/object-curly-newline': ['error', {
        ImportDeclaration: { multiline: true, consistent: true },
      }],
      '@stylistic/object-curly-spacing': ['error', 'always'],

      // arca
      '@arca/import-align': ['error', { collapseExtraSpaces: true }],

      // import
      '@import/order': ['error', {
        'newlines-between': 'always',
        groups:             ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        alphabetize:        { order: 'asc', caseInsensitive: true },
      }],
    },
  },
];
