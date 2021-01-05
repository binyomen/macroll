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
        'max-len': ['error', 120],
        'one-var': 'off',
        'no-magic-numbers': 'off',
        'lines-between-class-members': 'off',
        'quote-props': ['error', 'as-needed'],
        'object-property-newline': 'off',
        'sort-keys': 'off',
        'newline-per-chained-call': 'off',
        'prefer-named-capture-group': 'off',
        'no-else-return': 'off',
        'max-statements': 'off',
        'no-ternary': 'off',
        'operator-linebreak': ['error', 'after'],
        'wrap-regex': 'off',
        'no-extra-parens': 'off',
        'max-params': 'off',
        'array-element-newline': ['error', 'consistent'],
        'no-inline-comments': 'off',
        'default-case': 'off',
        'dot-location': ['error', 'property'],
        'max-lines-per-function': 'off',
        'max-lines': 'off',
        'no-alert': 'off',

        quotes: 'off',
        '@typescript-eslint/quotes': ['error', 'single'],

        'no-use-before-define': 'off',
        '@typescript-eslint/no-use-before-define': ['error', 'nofunc'],

        'space-before-function-paren': 'off',
        '@typescript-eslint/space-before-function-paren': ['error', {anonymous: 'never', named: 'never', asyncArrow: 'always'}],

        'comma-dangle': 'off',
        '@typescript-eslint/comma-dangle': ['error', 'always-multiline'],

        '@typescript-eslint/prefer-readonly-parameter-types': 'off',
        '@typescript-eslint/no-inferrable-types': 'off',
        '@typescript-eslint/no-magic-numbers': 'off',
        '@typescript-eslint/lines-between-class-members': 'off',
        '@typescript-eslint/restrict-template-expressions': 'off',
        '@typescript-eslint/no-type-alias': ['error', {allowAliases: 'in-unions'}],
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-extra-parens': 'off',
        '@typescript-eslint/naming-convention': ['error', {selector: 'enumMember', format: ['PascalCase']}],
    },
    env: {
        es6: true,
    },
};
