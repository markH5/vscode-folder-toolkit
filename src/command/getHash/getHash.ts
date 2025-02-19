import type { TF } from './getFileData';
import * as vscode from 'vscode';
import { getfsPathListEx } from '../../fsTools/getfsPathListEx';
import { sum } from '../../Math/sum';
import { fmtFileSize } from './fmtFileSize';
import { getFileData } from './getFileData';
import { json2md } from './json2md';

async function openAndShow(language: string, content: string): Promise<vscode.TextEditor> {
    return vscode.workspace
        .openTextDocument({ language, content })
        .then((v) => vscode.window.showTextDocument(v));
}

export async function getHash(_file: vscode.Uri, selectedFiles: vscode.Uri[]): Promise<void> {
    const timeStart: number = Date.now();
    const blockList: readonly RegExp[] = [
        /\/\.svn(?:\/|$)/u,
        /\/\.git(?:\/|$)/u,
        /\/node_modules(?:\/|$)/u,
    ];
    const select: readonly string[] = selectedFiles.map((u): string => u.fsPath.replaceAll('\\', '/'));
    const { need, notNeed } = getfsPathListEx(select, blockList);

    // if search > 50 show

    const fn = 'xxh64';
    const datas: readonly TF[] = await getFileData([...need], fn);

    const list: number[] = datas.map(v => v.Bytes);
    const totalSize: string = fmtFileSize(sum(list), 2);
    const totalFile: number = list.length;
    const timeEnd: number = Date.now();
    const useMs: number = timeEnd - timeStart;

    // -------
    const comment: string[] = [
        '1. not comment now',
    ];

    const excluded: Record<string, { fullPath: string, regexp: string; }[]> = {};
    notNeed.forEach((v, k) => (excluded[k] = v));
    const excludedRules: string[] = blockList.map((r: RegExp): string => r.toString());

    const json = {
        header: { comment, select, excludedRules, excluded },
        body: { datas },
        footer: { useMs, totalSize, totalFile },
    } as const;

    const jsonStr: string = JSON.stringify(json, null, 4);
    const mdStr: string = json2md(datas, json);

    await Promise.all([
        openAndShow('jsonc', jsonStr),
        openAndShow('markdown', mdStr),
    ]);
}
