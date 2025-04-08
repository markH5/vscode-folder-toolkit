import type { THashConfig } from '../../config.hash';
import type { TBlockRuler } from '../../config.hash.internal';
import type { TErrorLog, TProgress, TToken } from './def';
import type { TReport } from './getFileDataCore';
import { homepage, version } from '../../../package.json';
import { getfsPathListEx } from '../../fsTools/getfsPathListEx';
import { sum } from '../../Math/sum';
import { creatExcluded } from './creatExcluded';
import { fmtFileSize } from './fmtFileSize';
import { getFileDataCoreEx } from './getFileDataCore';
import { json2md } from './json2md';

export type THashReport = {
    json: string,
    md: string,
    errLog: TErrorLog,
};

export async function getHashCore(
    select: readonly string[],
    blockList: readonly TBlockRuler[],
    selectConfig: THashConfig,
    progress: TProgress,
    token: TToken,
): Promise<THashReport> {
    const timeStart: number = Date.now();
    const { need, notNeed } = getfsPathListEx(select, blockList);
    progress.report({ message: `total has ${need.length} files to calc hash`, increment: 0 });

    const errLog: TErrorLog = {};
    const datas: readonly TReport[] = await getFileDataCoreEx(need, selectConfig, errLog, progress, token);

    const list: number[] = datas.map(v => v.Bytes);
    const totalSize: string = fmtFileSize(sum(list), 2);
    const totalFile: number = list.length;
    const timeEnd: number = Date.now();
    const useMs: number = timeEnd - timeStart;

    // -------
    const comment = {
        version,
        homepage,
    };

    const excludedRules = blockList.map((r: TBlockRuler) => ({ name: r.name, reg: r.reg.toString() }));
    const excluded: Record<string, unknown[]> = creatExcluded(notNeed);

    const json = {
        header: { comment, select, selectConfig },
        body: { datas },
        footer: { useMs, totalSize, totalFile, excludedRules, excluded },
    } as const;

    return {
        json: JSON.stringify(json, null, 4),
        md: json2md(datas, json),
        errLog,
    };
}
