import type * as vscode from 'vscode';
import type { TBlockRuler } from '../../config.hash.internal';
/* eslint-disable node/prefer-global/buffer */
import type { TImg2webp_config } from '../../config/img2webp.def';
import type { TProgress } from '../getHash/def';
import { readFile, stat, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import { homepage, repository, version } from '../../../package.json';
import { getfsPathListEx } from '../../fsTools/getfsPathListEx';
import { creatExcluded } from '../getHash/creatExcluded';
import { fmtFileSize } from '../getHash/fmtFileSize';

function getNeedImg(files: readonly string[], selectConfig: TImg2webp_config): readonly string[] {
    const { allowList } = selectConfig;
    const need: string[] = [];

    for (const file of files) {
        for (const allow of allowList) {
            if (file.endsWith(allow)) {
                need.push(file);
            }
        }
    }
    return need;
}

export async function img2webpCore(
    select: readonly string[],
    blockList: readonly TBlockRuler[],
    selectConfig: TImg2webp_config,
    progress: TProgress,
    // eslint-disable-next-line unused-imports/no-unused-vars
    token: vscode.CancellationToken,
): Promise<string> {
    const timeStart: number = Date.now();
    const { need: needRaw, notNeed } = getfsPathListEx(select, blockList);

    const need: readonly string[] = getNeedImg(needRaw, selectConfig);

    console.log('need', { need });
    progress.report({ message: `total has ${need.length} files to calc hash`, increment: 0 });

    type TBaseData = {
        path: string,
        size: number,
        sizeS: string,
    };
    type TData = {
        raw: TBaseData,
        out: TBaseData,
        diff: {
            diff_size: string,
            diff: `${string}%`,
        },
    };
    const datas: TData[] = [];

    const step: number = 1 / (need.length);
    for (const [i, file1] of need.entries()) {
        const message: string = `(${i} of ${need.length}) to webp, "${file1}"`;
        progress.report({ message, increment: step });

        const buffer: Buffer = await readFile(file1);
        const data: Buffer = await sharp(buffer)
            .webp(selectConfig.sharp_options)
            .toBuffer();

        const file2: string = file1.replace(/\.\w+$/u, '.webp');
        await writeFile(file2, data);

        const s1 = await stat(file1);
        const s2 = await stat(file2);

        datas.push({
            raw: {
                path: file1,
                size: s1.size,
                sizeS: fmtFileSize(s1.size, 2),
            },
            out: {
                path: file2,
                size: s2.size,
                sizeS: fmtFileSize(s2.size, 2),
            },
            diff: {
                diff_size: fmtFileSize(s1.size - s2.size, 2),
                diff: `${(100 * (s1.size - s2.size) / s1.size).toFixed(2)}%`,
            },
        });
    }

    const timeEnd: number = Date.now();
    const useMs: number = timeEnd - timeStart;

    const comment = {
        version,
        homepage,
        repository,
    };

    const excludedRules = blockList.map((r: TBlockRuler) => ({ name: r.name, reg: r.reg.toString() }));
    const excluded: Record<string, unknown[]> = creatExcluded(notNeed);

    const json = {
        header: { comment, select, selectConfig },
        body: { datas },
        footer: { useMs, excludedRules, excluded },
    } as const;

    return JSON.stringify(json, null, 4);
}
