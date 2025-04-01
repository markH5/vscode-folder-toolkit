import type { TNotNeed, TNotNeedValue } from '../../fsTools/CollectorFsPathEx';

export function creatExcluded(notNeed: TNotNeed): Record<string, unknown[]> {
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
