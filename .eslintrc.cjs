module.exports = {
    root: true,
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:svelte/recommended",
        "plugin:import/recommended",
        "plugin:import/typescript",
    ],
    parser: "@typescript-eslint/parser",
    plugins: [
        "@typescript-eslint",
        "import",
    ],
    settings: {
        "import/resolver": {
            typescript: true,
            node: true,
        },
    },
    parserOptions: {
        sourceType: "module",
        ecmaVersion: 2020,
        extraFileExtensions: [".svelte"],
    },
    env: {
        browser: true,
        es2017: true,
        node: true,
    },
    overrides: [
        {
            files: ["*.svelte"],
            parser: "svelte-eslint-parser",
            parserOptions: {
                parser: "@typescript-eslint/parser",
            },
        },
    ],
    rules: {
        // Plugin Rules
        "@typescript-eslint/brace-style": ["error", "1tbs", { allowSingleLine: true }],
        "@typescript-eslint/consistent-type-definitions": ["warn", "interface"],
        "@typescript-eslint/consistent-type-imports": ["warn"],
        "@typescript-eslint/indent": [
            "warn", 4, {
                SwitchCase: 1,
                ignoredNodes: [
                    // Ignore multi-line generics in function calls.
                    "CallExpression > TSTypeParameterInstantiation.typeParameters",
                    // Ignore multi-line union types
                    "TSUnionType",
                ],
            },
        ],
        "@typescript-eslint/member-delimiter-style": ["warn"],
        "@typescript-eslint/no-unused-vars": ["error"],

        // Import Rules
        "import/consistent-type-specifier-style": ["error", "prefer-top-level"],
        "import/first": ["error"],
        "import/newline-after-import": ["warn", { count: 3 }],
        "import/no-absolute-path": ["error"],
        "import/no-mutable-exports": ["error"],
        "import/no-named-as-default-member": ["off"],
        // "import/no-relative-parent-imports": ["error"],
        "import/no-useless-path-segments": ["error"],
        "import/order": ["error", {
            "groups": [
                "builtin",
                "external",
            ],
            "newlines-between": "always",
            "alphabetize": {
                order: "asc",
                orderImportKind: "asc",
                caseInsensitive: true,
            },
        }],

        // Default auto-fix rules
        "arrow-parens": ["warn", "always"],
        "block-spacing": ["warn", "always"],
        "comma-dangle": ["warn", "always-multiline"],
        "curly": ["warn", "all"],
        "jsx-quotes": ["warn", "prefer-double"],
        "no-multi-spaces": ["off"],
        "object-curly-spacing": ["warn", "always", { objectsInObjects: true, arraysInObjects: true }],
        "padded-blocks": ["warn", "never"],
        "padding-line-between-statements": [
            "warn",
            { blankLine: "always", prev: "*", next: "return" },
            { blankLine: "always", prev: "*", next: "function" },
            { blankLine: "always", prev: "function", next: "*" },
        ],
        "quote-props": ["warn", "consistent-as-needed"],
        "quotes": ["warn", "double"],
        "space-before-blocks":  ["warn", "always"],
        "semi": ["warn", "always"],

        // Default non-auto-fix rules
        "max-len": ["error", { code: 120, ignoreStrings: true, ignoreComments: true }],
        "no-tabs": "error",
    },
};
