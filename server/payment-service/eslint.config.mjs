import sharedConfig from '../shared/eslint.base.mjs';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  ...sharedConfig,
  {
    languageOptions: {
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {},
);
