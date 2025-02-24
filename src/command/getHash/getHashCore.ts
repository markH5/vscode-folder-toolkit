import type { TBlockRuler, THashConfig } from '../../configUI.data';
import type { TNotNeed, TNotNeedValue } from '../../fsTools/CollectorFsPathEx';
import type { TProgress, TToken } from './def';
import type { TErrorLog, TReport } from './getFileDataCore';
import { homepage, repository, version } from '../../../package.json';
import { getfsPathListEx } from '../../fsTools/getfsPathListEx';
import { sum } from '../../Math/sum';
import { fmtFileSize } from './fmtFileSize';
import { getFileDataCoreEx } from './getFileDataCore';
import { json2md } from './json2md';

function creatExcluded(notNeed: TNotNeed): Record<string, unknown[]> {
    const excluded: Record<string, unknown[]> = {};

    for (const [k, rawV] of notNeed) {
        const arr = rawV
            .map((v: TNotNeedValue) => {
                const { ruler, ...v2 } = v;
                const { reg, ...r } = ruler;
                return ({
                    ...v2,
                    ruler: { ...r, reg: reg.toString() },
                });
            });
        excluded[k] = arr;
    }

    return excluded;
}

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

    const { fn } = selectConfig;
    const errLog: TErrorLog = {};
    const datas: readonly TReport[] = await getFileDataCoreEx(need, fn, errLog, progress, token);

    const list: number[] = datas.map(v => v.Bytes);
    const totalSize: string = fmtFileSize(sum(list), 2);
    const totalFile: number = list.length;
    const timeEnd: number = Date.now();
    const useMs: number = timeEnd - timeStart;

    // -------
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
        footer: { useMs, totalSize, totalFile, excludedRules, excluded },
    } as const;

    return {
        json: JSON.stringify(json, null, 4),
        md: json2md(datas, json),
        errLog,
    };
}
