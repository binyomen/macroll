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
        'no-console': 'off',
        'id-length': 'off',
        'max-classes-per-file': 'off',
        'max-len': ['error', 100],
        'one-var': 'off',
        'no-magic-numbers': 'off',
        'lines-between-class-members': 'off',

        quotes: 'off',
        '@typescript-eslint/quotes': ['error', 'single'],

        'no-use-before-define': 'off',
        '@typescript-eslint/no-use-before-define': ['error', 'nofunc'],

        'space-before-function-paren': 'off',
        '@typescript-eslint/space-before-function-paren': ['error', 'never'],

        '@typescript-eslint/prefer-readonly-parameter-types': 'off',
        '@typescript-eslint/no-inferrable-types': 'off',
        '@typescript-eslint/no-magic-numbers': 'off',
        '@typescript-eslint/lines-between-class-members': 'off',
        '@typescript-eslint/restrict-template-expressions': 'off',
    },
    env: {
        es6: true,
    },
};
