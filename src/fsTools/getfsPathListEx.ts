import type { TNotNeed } from './CollectorFsPathEx';
import { normalize } from 'node:path';
import { CollectorFsPathEx } from './CollectorFsPathEx';

/**
 * @param selectList = [...getWorkspaceRoot(), ...getAlwaysIncludeFolder()].sort()
 */
export function getfsPathListEx(
    selectList: readonly string[],
    blockList: readonly RegExp[],
) {
    const need: Set<string> = new Set<string>();
    const notNeed: TNotNeed = new Map();

    for (const fsPath of selectList) {
        const rootFsPath: string = normalize(fsPath).replaceAll('\\', '/');
        const root: string = rootFsPath;
        CollectorFsPathEx(rootFsPath, blockList, need, notNeed, root);
    }

    return { need, notNeed } as const;
}
