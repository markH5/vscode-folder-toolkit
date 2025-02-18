import * as vscode from 'vscode';
import { getfsPathListEx } from '../../fsTools/getfsPathListEx';
import { sum } from '../../Math/sum';
import { fmtFileSize } from './fmtFileSize';
import { getFileData } from './getFileData';

async function openAndShow(language: string, content: string): Promise<vscode.TextEditor> {
    return vscode.workspace
        .openTextDocument({ language, content })
        .then((v) => vscode.window.showTextDocument(v));
}

export async function getHash(_file: vscode.Uri, selectedFiles: vscode.Uri[]): Promise<void> {
    const t1: number = Date.now();
    const blockList: readonly RegExp[] = [
        /\/\.svn(?:\/|$)/u,
        /\/\.git(?:\/|$)/u,
        /\/node_modules(?:\/|$)/u,
    ];
    const select: readonly string[] = selectedFiles.map((u): string => u.fsPath.replaceAll('\\', '/'));
    const { need, notNeed } = getfsPathListEx(select, blockList);


    // if search > 50 show

    const fn = 'sha256';
    const datas = await getFileData([...need], fn);

    const list: number[] = datas.map(v => v.Bytes);
    const totalSize: string = fmtFileSize(sum(list), 2);
    const totalFile: number = list.length;
    const t2: number = Date.now();
    const useMs: number = t2 - t1;

    // -------
    const comment: string[] = [
        '1. not comment now',
    ];

    const excluded: Record<string, { fullPath: string; regexp: string; }[]> = {};
    notNeed.forEach((v, k) => (excluded[k] = v));
    const excludedRules = blockList.map((r: RegExp): string => r.toString());

    const json = {
        head: { comment, select, excludedRules, excluded },
        body: { datas },
        footer: { useMs, totalSize, totalFile },
    } as const;

    const jsonStr: string = JSON.stringify(json, null, 4);
    const mdStr: string = ((): string => {
        const arr: string[] = [
            "## footer ",
            "",
            "```json",
            JSON.stringify(json.head, null, 4),
            "```",
            "",
            "## body ",
            "",
            `| path | size | Bytes | hash(\`${fn}\`) |`,
            `| :--- | ---: | -----: | ---: |`,
        ];
        for (const d of datas) {
            arr.push(
                `| ${d.path} | ${d.size} | ${d.Bytes} | \`${d.hash.v}\` |`,
            );
        }

        arr.push(
            "",
            "",
            "## footer ",
            "",
            "```json",
            JSON.stringify(json.footer, null, 4),
            "```",
        );

        return arr.join("\n");
    })();


    await Promise.all([
        openAndShow('jsonc', jsonStr),
        openAndShow('markdown', mdStr),
    ]);
}
