import type { TBlockRuler } from '../../config.hash.internal';
import type { TImg2webp_config } from '../../config/img2webp.def';
import type { TProgress } from '../getHash/def';
import type { TData, TStatistics } from './def';
import { stat } from 'node:fs/promises';
import * as vscode from 'vscode';
import { homepage, version } from '../../../package.json';
import { getfsPathListEx } from '../../fsTools/getfsPathListEx';
import { fmtFileSize } from '../../utility/fmtFileSize';
import { math_sum } from '../../utility/math_sum';
import { sleep } from '../../utility/sleep';
import { exec_plus } from '../exec_plus';
import { creatExcluded } from '../share/creatExcluded';
import { md_body } from './md/md_body';

function getNeedImg(files: readonly string[], selectConfig: TImg2webp_config): readonly string[] {
    const { allowList } = selectConfig;
    const need: string[] = [];

    for (const file of files) {
        for (const allow of allowList) {
            if (file.toLowerCase().endsWith(allow)) {
                need.push(file);
            }
        }
    }
    return need;
}

function getDiffStr(a: number, b: number): `${'+' | '-'} ${string}%` {
    const diff_number = 100 * (a - b) / a;
    return `${diff_number < 0 ? '+' : '-'} ${Math.abs(diff_number).toFixed(2).padStart(5)}%`;
}

export async function img2webpCore(
    cwebp_Path: string,
    select: readonly string[],
    blockList: readonly TBlockRuler[],
    selectConfig: TImg2webp_config,
    progress: TProgress,
    token: vscode.CancellationToken,
): Promise<{
    json_report: unknown,
    markdown: string,
}> {
    const timeStart: number = Date.now();
    const { need: needRaw, notNeed } = getfsPathListEx(select, blockList);

    const need: readonly string[] = getNeedImg(needRaw, selectConfig);

    const cwebp_opt: string = selectConfig.opt;
    const max_cover_files: number = selectConfig.max_cover_files;

    progress.report({ message: `total has ${need.length} img`, increment: 0 });

    const datas: TData[] = [];

    const step: number = 100 / (need.length);

    const pool = new Map<number, Promise<void>>();
    let j = 0;
    for (const [i, input_file] of need.entries()) {
        const id: number = i + 1;
        const foo: Promise<void> = (async () => {
            const output_file: string = `${input_file.replace(/\.\w+$/u, '')}.webp`;

            //       cwebp [options] input_file -o output_file.webp
            const cmd = `"${cwebp_Path}" ${cwebp_opt} "${input_file}" -o "${output_file}"`;

            const exit_code: number = await exec_plus(cmd, `(id : ${id} of ${need.length}) to webp`);
            pool.delete(id);
            const s1 = await stat(input_file);
            const raw = {
                path: input_file,
                size: s1.size,
                sizeS: fmtFileSize(s1.size, 2),
            };

            j += 1;
            const message: string = `(${j + 1} of ${need.length}) to webp, "${input_file}"`;
            progress.report({ message, increment: step });

            if (exit_code !== 0) {
                vscode.window.showErrorMessage(`exit_code: ${exit_code},\nFailed to execute command: ${cmd}`);
                datas.push({
                    id,
                    raw,
                    out: {
                        path: output_file,
                        size: Number.NaN,
                        sizeS: 'unknown',
                    },
                    diff: {
                        diff_size: 'NaN',
                        diff: '+ unknown %',
                    },
                });
                return;
            }

            const s2 = await stat(output_file);
            datas.push({
                id,
                raw,
                out: {
                    path: output_file,
                    size: s2.size,
                    sizeS: fmtFileSize(s2.size, 2),
                },
                diff: {
                    diff_size: fmtFileSize(s1.size - s2.size, 2),
                    diff: getDiffStr(s1.size, s2.size),
                },
            });
        })();

        pool.set(id, foo);

        if (token.isCancellationRequested) {
            return { json_report: {}, markdown: '' };
        }

        while (true) {
            if (pool.size < max_cover_files) {
                break;
            }
            await sleep(100);
        }
    }

    const arr: Promise<void>[] = [...pool.values()];
    await Promise.all(arr);

    datas.sort((a, b) => a.id - b.id);
    const timeEnd: number = Date.now();
    const useMs: number = timeEnd - timeStart;

    const comment = {
        version,
        homepage,
    };

    const excluded: Record<string, unknown[]> = creatExcluded(notNeed);

    const raw_size_n: number = math_sum(datas.map((v) => v.raw.size));
    const out_size_n: number = math_sum(datas.map((v) => v.out.size));

    const statistics: TStatistics = {
        raw_size: fmtFileSize(raw_size_n, 2),
        out_size: fmtFileSize(out_size_n, 2),
        diff: getDiffStr(raw_size_n, out_size_n),
    };

    const json_report = {
        header: { comment, select },
        body: { datas, statistics },
        footer: { useMs, selectConfig, excluded },
    } as const;

    const md_arr: string[] = [];
    if (selectConfig.repors.includes('md')) {
        md_arr.push(
            '# header',
            '',
            '```json',
            JSON.stringify(json_report.header, null, '\t'),
            '```',
            '',
            '# body',
            '',
            ...md_body(datas, statistics),
            '',
            '# footer',
            '',
            '```json',
            JSON.stringify(json_report.footer, null, '\t'),
            '```',
        );
    }

    return {
        json_report,
        markdown: md_arr.join('\n'),
    };
}
