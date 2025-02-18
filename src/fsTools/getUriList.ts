import { CollectorFsPath } from './CollectorFsPath';

/**
 * @param WorkspaceFolderList = [...getWorkspaceRoot(), ...getAlwaysIncludeFolder()].sort()
 */
export function getfsPathList(WorkspaceFolderList: readonly string[], blockList: readonly RegExp[]): string[] {
    if (WorkspaceFolderList.length === 0) return [];

    const Collector: Set<string> = new Set<string>();
    const record: Set<string> = new Set<string>();

    for (const fsPath of WorkspaceFolderList) {
        const rootFsPath: string = fsPath.replaceAll('\\', '/');
        CollectorFsPath(rootFsPath, blockList, Collector, record);
    }

    const need: string[] = [];

    for (const fsPath of Collector) {
        need.push(fsPath);
    }

    return need;
}
