module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: 'tsconfig.json',
    },
    plugins: [
        '@typescript-eslint',
    ],
    extends: [
        'eslint:all',
        'plugin:@typescript-eslint/all',
    ],
    rules: {
        'function-call-argument-newline': ['error', 'consistent'],
        'linebreak-style': 'off',
        'arrow-parens': ['error', 'as-needed'],
        'padded-blocks': ['error', 'never'],
        'func-style': 'off',

        quotes: 'off',
        '@typescript-eslint/quotes': ['error', 'single'],

        'no-use-before-define': 'off',
        '@typescript-eslint/no-use-before-define': ['error', 'nofunc'],

        'space-before-function-paren': 'off',
        '@typescript-eslint/space-before-function-paren': ['error', 'never'],

        '@typescript-eslint/prefer-readonly-parameter-types': 'off',
    },
    env: {
        es6: true,
    },
};
