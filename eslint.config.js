import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  { ignores: ['**/node_modules/**', '**/dist/**', 'observability/grafana/dashboards/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
      globals: globals.node
    },
    rules: { '@typescript-eslint/no-explicit-any': 'off' }
  },
  {
    files: ['**/tests/**/*.ts'],
    languageOptions: { parserOptions: { projectService: false } }
  },
  {
    files: ['framework/**/*.js', 'tests/performance/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        __ENV: 'readonly',
        __VU: 'readonly',
        __ITER: 'readonly'
      }
    }
  },
  {
    files: ['quality/**/*.js', 'scripts/**/*.js'],
    languageOptions: { globals: globals.node },
    rules: { 'no-console': 'off' }
  }
];
