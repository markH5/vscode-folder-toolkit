import type { TNotNeed, TNotNeedValue } from '../../fsTools/CollectorFsPathEx';

export function creatExcluded(notNeed: TNotNeed): Record<string, unknown[]> {
    const excluded: Record<string, TNotNeedValue[]> = {};

    for (const [k, rawV] of notNeed) {
        const aaa = excluded[k] ?? [];
        aaa.push(...rawV);
        excluded[k] = aaa;
    }

    return excluded;
}
