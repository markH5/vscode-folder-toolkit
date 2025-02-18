import { normalize } from 'node:path/posix';
import { dump, load } from 'js-yaml';
import * as vscode from 'vscode';
import { getfsPathList } from '../../fsTools/getUriList';
import { sum } from '../../Math/sum';
import { fmtFileSize } from './fmtFileSize';
import { getFileData } from './getFileData';

async function openAndShow(language: string, content: string): Promise<vscode.TextEditor> {
    return vscode.workspace
        .openTextDocument({ language, content })
        .then((v) => vscode.window.showTextDocument(v));
}

export async function getHash(_file: vscode.Uri, selectedFiles: vscode.Uri[]): Promise<void> {
    const t1 = Date.now();
    const blockList: readonly RegExp[] = [
        /\/\.svn\//u,
        /\/\.git\//u,
        /\/node_modules\//u,
    ];
    const select: readonly string[] = selectedFiles
        .map((u): string => normalize(u.fsPath).replaceAll('\\', '/'));

    const search: readonly string[] = getfsPathList(select, blockList);
    // if search > 50 show

    const fn = 'xxh32';
    const data = await getFileData(search, fn);

    const list = data.map(v => v.sizeRaw);
    const totalSize: string = fmtFileSize(sum(list), 2);
    const totalFile = list.length;
    const t2: number = Date.now();
    const useMs: number = t2 - t1;

    const comment: string[] = [
        '0. not comment now',
    ];
    const jsonStr: string = JSON.stringify(
        {
            head: { comment, select },
            body: { search, data },
            footer: { useMs, totalSize, totalFile },
        },
        null,
        4,
    );

    const yamlStr = dump(load(jsonStr));

    await Promise.all([
        openAndShow('jsonc', jsonStr),
        openAndShow('yaml', yamlStr),
    ]);
}
