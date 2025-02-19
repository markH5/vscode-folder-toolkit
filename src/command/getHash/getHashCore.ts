import type { TBlockRuler, TNotNeedValue } from '../../fsTools/CollectorFsPathEx';
import type { TF, THash } from './getFileData';
import { getfsPathListEx } from '../../fsTools/getfsPathListEx';
import { sum } from '../../Math/sum';
import { fmtFileSize } from './fmtFileSize';
import { getFileData } from './getFileData';
import { json2md } from './json2md';


export type THashReport = {
    json: string,
    md: string;
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
    const comment: string[] = [
        '1. not comment now',
    ];

    const excludedRules = blockList.map((r: TBlockRuler) => ({ name: r.name, reg: r.reg.toString() }));
    const excluded: Record<string, unknown[]> = {};

    notNeed.forEach((rawV: TNotNeedValue[], k: string): void => {
        const cc = rawV
            .map((v: TNotNeedValue) => ({
                fullPath: v.fullPath,
                root: v.root,
                ruler: { name: v.ruler.name, reg: v.ruler.reg.toString() },
            }));

        excluded[k] = cc;
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
