import type { TBlockRuler } from '../../config.hash.internal';
import type { TImg2webp_config } from '../../config/img2webp.def';
import type { TProgress } from '../getHash/def';
import { stat } from 'node:fs/promises';
import * as vscode from 'vscode';
import { homepage, repository, version } from '../../../package.json';
import { getfsPathListEx } from '../../fsTools/getfsPathListEx';
import { exec_plus } from '../exec_plus';
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
    cwebp_Path: string,
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

    // const cwebp_opt: string = JSON.stringify(selectConfig.opt);
    const cwebp_opt: string = selectConfig.opt;

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
    for (const [i, input_file] of need.entries()) {
        const message: string = `(${i + 1} of ${need.length}) to webp, "${input_file}"`;
        progress.report({ message, increment: step });

        const output_file: string = `${input_file.replace(/\.\w+$/u, '')}.webp`;

        //       cwebp [options] input_file -o output_file.webp
        const cmd = `"${cwebp_Path}" ${cwebp_opt} "${input_file}" -o "${output_file}"`;
        const exit_code: number = await exec_plus(cmd, `(${i + 1} of ${need.length}) to webp`);
        if (exit_code !== 0) {
            vscode.window.showErrorMessage(`Failed to execute command: ${cmd}`);
            vscode.window.showErrorMessage(`exit_code: ${exit_code}`);
            continue;
        }

        const s1 = await stat(input_file);
        const s2 = await stat(output_file);

        datas.push({
            raw: {
                path: input_file,
                size: s1.size,
                sizeS: fmtFileSize(s1.size, 2),
            },
            out: {
                path: output_file,
                size: s2.size,
                sizeS: fmtFileSize(s2.size, 2),
            },
            diff: {
                diff_size: fmtFileSize(s1.size - s2.size, 2),
                diff: `- ${(100 * (s1.size - s2.size) / s1.size).toFixed(2)}%`,
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

    const excluded: Record<string, unknown[]> = creatExcluded(notNeed);

    const json = {
        header: { comment, select, selectConfig },
        body: { datas },
        footer: { useMs, excluded },
    } as const;

    return JSON.stringify(json, null, 4);
}
