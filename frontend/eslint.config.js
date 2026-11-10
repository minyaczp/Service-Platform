import tseslint from 'typescript-eslint';
import importX from 'eslint-plugin-import-x';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'public/**'] },
  ...tseslint.configs.strict,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'import-x': importX },
    settings: {
      'import-x/resolver-next': [importX.createNodeResolver({ extensions: ['.ts', '.tsx', '.js'] })],
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'import-x/no-cycle': 'error',
      'max-lines-per-function': ['warn', { max: 20, skipBlankLines: true, skipComments: true }],
    },
  },
);
