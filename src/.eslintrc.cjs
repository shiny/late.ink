module.exports = {
    env: {
        node: true,
        es2021: true
    },
    parserOptions: {
        ecmaVersion: 'latest',
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended'
    ],
    overrides: [
    ],
    parser: '@typescript-eslint/parser',
    plugins: [
        '@typescript-eslint'
    ],
    rules: {
        indent: [
            'error',
            4
        ],
        'linebreak-style': [
            'error',
            'unix'
        ],
        quotes: [
            'error',
            'single'
        ],
        semi: [
            'error',
            'never'
        ]
    }
}
