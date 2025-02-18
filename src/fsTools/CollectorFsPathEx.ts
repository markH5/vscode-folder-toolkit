import * as fs from 'node:fs';

export function fsPathIsAllow(fsPath: string, blockList: readonly RegExp[]): boolean {
    return !blockList.some((reg: RegExp): boolean => reg.test(fsPath));
}

export function findBlockRuler(fsPath: string, blockList: readonly RegExp[]): string | undefined {
    const reg: RegExp | undefined = blockList.find((reg: RegExp): boolean => reg.test(fsPath));
    if (reg === undefined) return undefined;
    return reg.toString();
}

export type TNotNeed = Map<string, ({
    fullPath: string,
    regexp: string,
})[]>;

export function CollectorFsPathEx(
    fsPath: string,
    blockList: readonly RegExp[],
    Collector: Set<string>,
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
           
            const blockRuler: string | undefined = findBlockRuler(needCheckPath, blockList);
            if (blockRuler === undefined) {
                CollectorFsPathEx(fsPathNext, blockList, Collector, notNeed, root);
            } else {
                const rejectArr = notNeed.get(needCheckPath) ?? [];
                rejectArr.push({
                    fullPath: fsPathNext,
                    regexp: blockRuler,
                });
                notNeed.set(needCheckPath, rejectArr);
            }
        }
    } else if (Stats.isFile()) {
        Collector.add(fsPath);
    }
}
