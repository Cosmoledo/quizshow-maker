module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint"
    ],
    "rules": {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-inferrable-types": "off",
        "@typescript-eslint/no-namespace": "off",
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/prefer-namespace-keyword": "off",
        "@typescript-eslint/type-annotation-spacing": "off",
        "block-scoped-var": "error",
        "indent": ["error", "tab", {
            "SwitchCase": 1
        }],
        "linebreak-style": ["error", "windows"],
        "no-alert": "off",
        "no-case-declarations": "off",
        "no-var": "error",
        "quotes": ["error", "double"],
        "semi": ["error", "always"],
        "yoda": ["error", "never"],
    }
}
