// eslint-disable-next-line no-undef
module.exports = {
    settings: {
        "react": {
            "version": "detect"
        }
    },
    'env': {
        'browser': true,
        'es2021': true
    },
    'extends': [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:@typescript-eslint/recommended'
    ],
    'overrides': [
    ],
    'parser': '@typescript-eslint/parser',
    'parserOptions': {
        'ecmaVersion': 'latest',
        'sourceType': 'module'
    },
    'plugins': [
        'react',
        '@typescript-eslint'
    ],
    'rules': {
        'indent': [
            'warn',
            4
        ],
        'linebreak-style': [
            'warn',
            'unix'
        ],
        'semi': [
            'warn',
            'never'
        ],
        'no-useless-catch': 'off',
        'react/react-in-jsx-scope': 'off',
        'react/jsx-no-target-blank': 'off',
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-this-alias": "off",
    }
}
