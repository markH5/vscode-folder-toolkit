import type { TBlockRuler } from '../configUI.data';
import * as fs from 'node:fs';

export function findBlockRuler(fsPath: string, blockList: readonly TBlockRuler[]): TBlockRuler | undefined {
    return blockList.find((r: TBlockRuler): boolean => r.reg.test(fsPath));
}

export type TNotNeedValue = {
    fullPath: string,
    ruler: TBlockRuler,
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

    const Stats: fs.Stats = fs.statSync(fsPath);
    if (Stats.isDirectory()) {
        const files: string[] = fs.readdirSync(fsPath);
        for (const file of files) {
            const fsPathNext = `${fsPath}/${file}`;
            const needCheckPath: string = fsPathNext.replace(root, '');

            const blockRuler: TBlockRuler | undefined = findBlockRuler(needCheckPath, blockList);
            if (blockRuler === undefined) {
                CollectorFsPathEx(fsPathNext, blockList, need, notNeed, root);
            } else {
                const rejectArr = notNeed.get(needCheckPath) ?? [];
                rejectArr.push({
                    fullPath: fsPathNext,
                    ruler: blockRuler,
                    root,
                });
                notNeed.set(blockRuler.name, rejectArr);
            }
        }
    } else if (Stats.isFile()) {
        need.add(fsPath);
    }
}
