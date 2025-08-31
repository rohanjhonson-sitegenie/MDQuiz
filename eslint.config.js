import globals from 'globals'
import js from '@eslint/js'
import pluginQuery from '@tanstack/eslint-plugin-query'
import boundaries from 'eslint-plugin-boundaries'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'src/components/ui', 'supabase'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      ...pluginQuery.configs['flat/recommended'],
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      boundaries: boundaries,
    },
    settings: {
      'boundaries/elements': [
        { type: 'shared', pattern: 'src/components/**' },
        { type: 'shared', pattern: 'src/lib/**' },
        { type: 'shared', pattern: 'src/hooks/**' },
        { type: 'feature-api', pattern: 'src/features/*/api/**' },
        { type: 'feature-components', pattern: 'src/features/*/components/**' },
        { type: 'feature-hooks', pattern: 'src/features/*/hooks/**' },
        {
          type: 'feature-internal',
          pattern: 'src/features/*/!(api|components|hooks)/**',
        },
        { type: 'routes', pattern: 'src/routes/**' },
      ],
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'no-console': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            {
              from: ['shared'],
              allow: ['shared'],
            },
            {
              from: ['feature-api'],
              allow: ['shared'],
            },
            {
              from: ['feature-components'],
              allow: ['shared', 'feature-api', 'feature-hooks'],
            },
            {
              from: ['feature-hooks'],
              allow: ['shared', 'feature-api'],
            },
            {
              from: ['feature-internal'],
              allow: [
                'shared',
                'feature-api',
                'feature-hooks',
                'feature-components',
              ],
            },
            {
              from: ['routes'],
              allow: ['shared', 'feature-api', 'feature-components'],
            },
          ],
        },
      ],
      // Prevent mixed authentication patterns - requireAuth has been removed
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@/lib/auth-guards',
              importNames: ['requireAuth'],
              message:
                'requireAuth has been removed. Use requireRole instead for consistent authentication.',
            },
          ],
        },
      ],
    },
  }
)
