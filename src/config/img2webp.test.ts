/* eslint-disable sonarjs/no-unused-vars */
import type { InferOutput } from 'valibot';
import type { TImg2webp_config } from './img2webp.def';
import type { schema } from "./img2webps.chema";

import { expect, it } from 'vitest';
import { contributes } from '../../package.json';
import { safeParserConfig_1 } from "./img2webps.chema";
const { configuration } = contributes;


it('check config-0 default val is allow', (): void => {
    const list: unknown[] = configuration[1].properties['vscode-folder-toolkit.img2webp']?.default ?? [];

    for (const data of list) {
        const shouldBeOK = safeParserConfig_1(data);
        expect(shouldBeOK.success).toBe(true);
    }
});


{
    // check type in tsc

    type T_schema = InferOutput<typeof schema>;
    const _test_1: IsEqual<T_schema, TImg2webp_config> = true;
}
