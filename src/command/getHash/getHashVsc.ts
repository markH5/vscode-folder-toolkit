import type { TBlockRuler } from '../../fsTools/CollectorFsPathEx';
import * as vscode from 'vscode';
import { getHashCore } from './getHashCore';

async function openAndShow(language: string, content: string): Promise<vscode.TextEditor> {
    const doc: vscode.TextDocument = await vscode.workspace.openTextDocument({ language, content });
    const textEditor: vscode.TextEditor = await vscode.window.showTextDocument(doc);
    // i want this api
    // https://github.com/microsoft/vscode/issues/136927
    return textEditor;
}

export async function getHashVsc(_file: vscode.Uri, selectedFiles: vscode.Uri[]): Promise<void> {
    const select: readonly string[] = selectedFiles.map((u): string => u.fsPath.replaceAll('\\', '/'));
    const blockList: readonly TBlockRuler[] = [
        {
            name: 'not node_modules',
            reg: /\/node_modules(?:\/|$)/u,
        },
        {
            name: 'not .git',
            reg: /\/\.git(?:\/|$)/u,
        },
        {
            name: 'not .svn',
            reg: /\/\.svn(?:\/|$)/u,
        },
        // /\/\.svn(?:\/|$)/u,
        // /\/\.git(?:\/|$)/u,
        // /\/node_modules(?:\/|$)/u,
    ];

    const { json, md } = await getHashCore(select, blockList, 'md5');

    await Promise.all([
        openAndShow('jsonc', json),
        openAndShow('markdown', md),
    ]);
}
