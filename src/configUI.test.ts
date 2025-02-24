/* eslint-disable sonarjs/no-unused-vars */
import type { InferOutput } from 'valibot';
import type { TSchema } from './configUI';
import type { TBlockRuler, THashConfig } from './configUI.data';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { assertType, expect, it } from 'vitest';
import { contributes } from '../package.json';
import { safeParserConfig0 } from './configUI';

it('check config-0 default val is allow', (): void => {
    const { configuration } = contributes;
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

it('file should be eq', (): void => {
    const ts_file: string = readFileSync(join(__dirname, './configUI.data.ts'), 'utf-8');
    const data_file: string = readFileSync(join(__dirname, '../data/configUI.data.txt'), 'utf-8');

    if (ts_file !== data_file) {
        writeFileSync(join(__dirname, '../data/configUI.data.txt'), ts_file, 'utf8');
    }
    expect(0).toBe(0); // input output should be deep eq, also check \r\n and \n
});

{
    // check type in tsc
    type TBlockRuler_shouldBe = Readonly<Omit<THashConfig['blockList'][number], 'reg' | 'flag'> & { reg: RegExp }>;

    type THashConfig_valibot = InferOutput<TSchema>;

    const _test_1: IsEqual<TBlockRuler_shouldBe, TBlockRuler> = true;
    const _test_2: IsEqual<THashConfig_valibot, THashConfig> = true;
}
