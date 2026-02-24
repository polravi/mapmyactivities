/** @type {import('eslint').Linter.Config} */
module.exports = {
  ...require('./eslint'),
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    ...require('./eslint').rules,
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
  },
};
