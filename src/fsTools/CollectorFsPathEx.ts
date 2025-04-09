import type { Stats } from 'node:fs';
import type { TBlockRuler } from '../config.hash.internal';
import { readdirSync, statSync } from 'node:fs';

export function findBlockRuler(fsPath: string, blockList: readonly TBlockRuler[]): TBlockRuler | undefined {
    return blockList.find((r: TBlockRuler): boolean => r.reg.test(fsPath));
}

export type TNotNeedValue = {
    fullPath: string,
    root: string,
};

/**
 * key = ruler-name
 */
export type TNotNeed = Map<string, TNotNeedValue[]>;

export function CollectorFsPathEx(
    fsPath: string,
    blockList: readonly TBlockRuler[],
    need: Set<string>,
    notNeed: TNotNeed,
    root: string,
): void {
    if ((/\.asar$/iu).test(fsPath)) return;

    const stats: Stats = statSync(fsPath);
    if (stats.isDirectory()) {
        const files: string[] = readdirSync(fsPath);
        for (const file of files) {
            const fsPathNext = `${fsPath}/${file}`;
            const needCheckPath: string = fsPathNext.replace(root, '');

            const blockRuler: TBlockRuler | undefined = findBlockRuler(needCheckPath, blockList);
            if (blockRuler === undefined) {
                CollectorFsPathEx(fsPathNext, blockList, need, notNeed, root);
            } else {
                const rejectArr = notNeed.get(blockRuler.name) ?? [];
                rejectArr.push({
                    fullPath: fsPathNext,
                    root,
                });
                notNeed.set(blockRuler.name, rejectArr);
            }
        }
    } else if (stats.isFile()) {
        need.add(fsPath);
    }
}
