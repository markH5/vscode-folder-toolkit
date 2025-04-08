import type { TBlockRuler } from '../../config.hash.internal';
import type { TImg2webp_config } from '../../config/img2webp.def';
import type { TProgress } from '../getHash/def';
import type { TData } from './def';
import { stat } from 'node:fs/promises';
import * as vscode from 'vscode';
import { homepage, repository, version } from '../../../package.json';
import { getfsPathListEx } from '../../fsTools/getfsPathListEx';
import { exec_plus } from '../exec_plus';
import { creatExcluded } from '../getHash/creatExcluded';
import { fmtFileSize } from '../getHash/fmtFileSize';
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

export async function img2webpCore(
    cwebp_Path: string,
    select: readonly string[],
    blockList: readonly TBlockRuler[],
    selectConfig: TImg2webp_config,
    progress: TProgress,
    // eslint-disable-next-line unused-imports/no-unused-vars
    token: vscode.CancellationToken,
): Promise<{
    json_report: unknown,
    markdown: string,
}> {
    const timeStart: number = Date.now();
    const { need: needRaw, notNeed } = getfsPathListEx(select, blockList);

    const need: readonly string[] = getNeedImg(needRaw, selectConfig);

    // const cwebp_opt: string = JSON.stringify(selectConfig.opt);
    const cwebp_opt: string = selectConfig.opt;
    const max_cover_files: number = selectConfig.max_cover_files;

    progress.report({ message: `total has ${need.length} files to calc hash`, increment: 0 });

    const datas: TData[] = [];

    const step: number = 1 / (need.length);
    const need_arr: Promise<void>[] = [];
    let j = 0;
    for (const [i, input_file] of need.entries()) {
        const foo: Promise<void> = (async () => {
            const output_file: string = `${input_file.replace(/\.\w+$/u, '')}.webp`;

            //       cwebp [options] input_file -o output_file.webp
            const cmd = `"${cwebp_Path}" ${cwebp_opt} "${input_file}" -o "${output_file}"`;
            const id = i + 1;
            const exit_code: number = await exec_plus(cmd, `(id : ${id} of ${need.length}) to webp`);

            const s1 = await stat(input_file);
            j += 1;
            const message: string = `(${j + 1} of ${need.length}) to webp, "${input_file}"`;
            progress.report({ message, increment: step });
            const raw = {
                path: input_file,
                size: s1.size,
                sizeS: fmtFileSize(s1.size, 2),
            };
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
            const diff_number = 100 * (s1.size - s2.size) / s1.size;
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
                    diff: `${diff_number < 0 ? '+' : '-'} ${Math.abs(diff_number).toFixed(2)}%`,
                },
            });
        })();

        need_arr.push(foo);
        if (need_arr.length > max_cover_files) {
            await Promise.all(need_arr);
            need_arr.length = 0;
        }
    }

    await Promise.all(need_arr);

    datas.sort((a, b) => a.id - b.id);
    const timeEnd: number = Date.now();
    const useMs: number = timeEnd - timeStart;

    const comment = {
        version,
        homepage,
        repository,
    };

    const excluded: Record<string, unknown[]> = creatExcluded(notNeed);

    const json_report = {
        header: { comment, select },
        body: { datas },
        footer: { useMs, selectConfig, excluded },
    } as const;

    const md_arr: string[] = [];
    if (selectConfig.repors.includes('md')) {
        md_arr.push(
            '# header',
            '',
            '```json',
            JSON.stringify(json_report.header, null, 2),
            '```',
            '',
            '# body',
            '',
            ...md_body(datas),
            '',
            '# footer',
            '',
            '```json',
            JSON.stringify(json_report.footer, null, 2),
            '```',
        );
    }

    return {
        json_report,
        markdown: md_arr.join('\n'),
    };
}
