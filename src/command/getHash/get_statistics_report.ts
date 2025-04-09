import type { TStatistics } from './def';
import type { TReport } from './getFileDataCore';

export function get_statistics_report(datas: readonly TReport[]): TStatistics {
    const map: Map<string, TReport[]> = Map.groupBy(datas, (item: TReport) => {
        return item.hash.v;
    });

    const report: Record<string, string[]> = {};

    for (const [k, report0] of map) {
        if (report0.length === 1) continue;
        report[k] = report0.map((v) => v.path);
    }

    return {
        msg: 'notes: Different files may happen to have the same hash, which is called [Hash collision](https://en.wikipedia.org/wiki/Hash_collision)',
        report,
    };
}
