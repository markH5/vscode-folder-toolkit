import * as fs from 'node:fs';

export function fsPathIsAllow(fsPath: string, blockList: readonly RegExp[]): boolean {
    return !blockList.some((reg: RegExp): boolean => reg.test(fsPath));
}

export const defautlBlockList: readonly RegExp[] = [
    /\/\.(?:svn|git)\//u,
    /\/node_modules\//u,
];

export function CollectorFsPath(
    fsPath: string,
    blockList: readonly RegExp[],
    Collector: Set<string>,
    record: Set<string>,
): void {
    if ((/\.asar$/iu).test(fsPath)) return;

    const Stats: fs.Stats = fs.statSync(fsPath);
    if (Stats.isDirectory()) {
        const files: string[] = fs.readdirSync(fsPath);
        for (const file of files) {
            const fsPathNext = `${fsPath}/${file}`;

            if (!record.has(fsPathNext)) {
                record.add(fsPathNext);
                if (fsPathIsAllow(fsPathNext, blockList)) {
                    CollectorFsPath(fsPathNext, blockList, Collector, record);
                }
            }
        }
    } else if (Stats.isFile()) {
        Collector.add(fsPath);
    }
}
