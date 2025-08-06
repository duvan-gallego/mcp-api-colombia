import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  {
    files: ['**/*.ts'],

    languageOptions: {
      parser: tsparser,
      sourceType: 'module',
    },

    ignores: ['node_modules/', 'dist/**', 'src/client/**'],

    plugins: {
      '@typescript-eslint': tseslint,
      prettier: prettierPlugin,
    },

    rules: {
      // TypeScript recommended rules
      ...tseslint.configs.recommended.rules,
      // Disable ESLint rules that conflict with Prettier
      ...prettierConfig.rules,
      // Custom rules
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'warn',
      semi: ['error', 'always'],
      quotes: ['warn', 'single'],
      // Ensure Prettier formatting is enforced
      'prettier/prettier': 'error',
    },
  },
];
