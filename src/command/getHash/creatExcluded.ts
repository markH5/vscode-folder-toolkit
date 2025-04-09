import type { TNotNeed, TNotNeedValue } from '../../fsTools/CollectorFsPathEx';

export function creatExcluded(notNeed: TNotNeed): Record<string, unknown[]> {
    const excluded: Record<string, TNotNeedValue[]> = {};

    for (const [k, rawV] of notNeed) {
        excluded[k] = rawV;
    }

    return excluded;
}
