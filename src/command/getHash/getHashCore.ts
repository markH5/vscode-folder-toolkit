import type { TBlockRuler, TNotNeedValue } from '../../fsTools/CollectorFsPathEx';
import type { TF, THash } from './getFileData';
import { homepage, repository, version } from '../../../package.json';
import { getfsPathListEx } from '../../fsTools/getfsPathListEx';
import { sum } from '../../Math/sum';
import { fmtFileSize } from './fmtFileSize';
import { getFileData } from './getFileData';
import { json2md } from './json2md';

export type THashReport = {
    json: string,
    md: string,
};

export async function getHashCore(
    select: readonly string[],
    blockList: readonly TBlockRuler[],
    fn: THash,
): Promise<THashReport> {
    const timeStart: number = Date.now();
    const { need, notNeed } = getfsPathListEx(select, blockList);
    // if search > 50 show

    const datas: readonly TF[] = await getFileData([...need], fn);

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
    const excluded: Record<string, unknown[]> = {};

    notNeed.forEach((rawV: TNotNeedValue[], k: string): void => {
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
    });

    const json = {
        header: { comment, select },
        body: { datas },
        footer: { useMs, totalSize, totalFile, excludedRules, excluded },
    } as const;

    return {
        json: JSON.stringify(json, null, 4),
        md: json2md(datas, json),
    };
}
