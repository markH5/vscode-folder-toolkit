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
    blockList: readonly RegExp[],
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

    const excluded: Record<string, { fullPath: string, regexp: string; }[]> = {};
    notNeed.forEach((v, k) => (excluded[k] = v));
    const excludedRules: string[] = blockList.map((r: RegExp): string => r.toString());

    const json = {
        header: { comment, select, excludedRules, excluded },
        body: { datas },
        footer: { useMs, totalSize, totalFile },
    } as const;

    return {
        json: JSON.stringify(json, null, 4),
        md: json2md(datas, json),
    };
}
