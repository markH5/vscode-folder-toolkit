import * as vscode from 'vscode';
import { getHashCore } from './getHashCore';

async function openAndShow(language: string, content: string): Promise<vscode.TextEditor> {
    return vscode.workspace
        .openTextDocument({ language, content })
        .then((v) => vscode.window.showTextDocument(v));
}

export async function getHashVsc(_file: vscode.Uri, selectedFiles: vscode.Uri[]): Promise<void> {
    const select: readonly string[] = selectedFiles.map((u): string => u.fsPath.replaceAll('\\', '/'));
    const blockList: readonly RegExp[] = [
        /\/\.svn(?:\/|$)/u,
        /\/\.git(?:\/|$)/u,
        /\/node_modules(?:\/|$)/u,
    ];

    const { json, md } = await getHashCore(select, blockList, 'md5');

    await Promise.all([
        openAndShow('jsonc', json),
        openAndShow('markdown', md),
    ]);
}
