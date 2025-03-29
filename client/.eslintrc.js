module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { 
      'varsIgnorePattern': '.*',
      'argsIgnorePattern': '.*',
      'ignoreRestSiblings': true,
      'caughtErrorsIgnorePattern': '.*',
      'destructuredArrayIgnorePattern': '.*',
      'imports': 'ignore'
    }],
  },
};