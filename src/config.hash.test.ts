/* eslint-disable sonarjs/no-unused-vars */
import type { InferOutput } from 'valibot';
import type { THashConfig } from './config.hash';
import type { TBlockRuler } from './config.hash.internal';
import type { TSchema } from './config.hash.schema';
import { assertType, expect, it } from 'vitest';
import { contributes } from '../package.json';
import { safeParserConfig0 } from './config.hash.schema';

const { configuration } = contributes;

it('check config-0 default val is allow', (): void => {
    const list: unknown[] = configuration[0].properties['vscode-folder-toolkit.hashToolkitConfig']!.default;

    for (const data of list) {
        const shouldBeOK = safeParserConfig0(data);
        expect(shouldBeOK.success).toBe(true);

        if (shouldBeOK.success) {
            assertType<THashConfig>(shouldBeOK.output);
        }
    }
});

it('check config-0 fake input', (): void => {
    const data: unknown = {
        'name': 'default md5',
        'fn': 'md 5',
        'report': [
            'json',
            'md',
        ],
        'blockList': [
            {
                'name': 'not node_modules',
                'reg': '\\/node_modules(?:\\/|$)',
            },
            {
                'name': 'not .git',
                'reg': '\\/\\.git(?:\\/|$)',
            },
            {
                'name': 'not .svn',
                'reg': '\\/\\.svn(?:\\/|$)',
            },
        ],
    };

    const shouldBeError = safeParserConfig0(data);
    expect(shouldBeError.success).toBe(false); // report should be "json" | "md" | "both"
});

{
    // check type in tsc
    type TBlockRuler_shouldBe = Readonly<Omit<THashConfig['blockList'][number], 'reg' | 'flag'> & { reg: RegExp }>;

    type THashConfig_valibot = InferOutput<TSchema>;

    const _test_1: IsEqual<TBlockRuler_shouldBe, TBlockRuler> = true;
    const _test_2: IsEqual<THashConfig_valibot, THashConfig> = true;
}
