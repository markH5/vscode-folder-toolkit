// @ts-check
import antfu from '@antfu/eslint-config';
import sonarjs from 'eslint-plugin-sonarjs';

const config = antfu({
    // react: true,
    stylistic: false,
    ignores: [
        'tsconfig.json',
    ],
    rules: {
        'ts/consistent-type-definitions': ['error', 'type'],
        'no-console': 'off',
        'node/prefer-global/process': 'off',
        'no-restricted-syntax': 'off',
    },
});

export default [
    ...await config,
    sonarjs.configs.recommended, // https://github.com/SonarSource/SonarJS/blob/master/packages/jsts/src/rules/README.md#for-eslint-9
    {
        'rules': {
            'sonarjs/no-commented-code': 'off',
        },
    },
];

// https://github.com/antfu/eslint-config?tab=readme-ov-file#view-what-rules-are-enabled
// pnpm dlx @eslint/config-inspector
