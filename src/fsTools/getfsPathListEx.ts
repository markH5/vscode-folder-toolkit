import type { TBlockRuler, TNotNeed } from './CollectorFsPathEx';
import { normalize } from 'node:path';
import { CollectorFsPathEx } from './CollectorFsPathEx';


export type TSearch = {
    readonly need: readonly string[];
    readonly notNeed: TNotNeed;
};

export function getfsPathListEx(
    selectList: readonly string[],
    blockList: readonly TBlockRuler[],
): TSearch {
    const need: Set<string> = new Set<string>();
    const notNeed: TNotNeed = new Map();

    for (const fsPath of selectList) {
        const rootFsPath: string = normalize(fsPath).replaceAll('\\', '/');
        const root: string = rootFsPath;
        CollectorFsPathEx(rootFsPath, blockList, need, notNeed, root);
    }

    return { need: [...need], notNeed } as const;
}
