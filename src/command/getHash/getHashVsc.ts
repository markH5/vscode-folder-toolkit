import type { TBlockRuler } from '../../fsTools/CollectorFsPathEx';
import * as vscode from 'vscode';
import { name } from '../../../package.json';
import { safeParserConfig0 } from '../../configUI';
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

    const allConfig = vscode.workspace.getConfiguration(name);
    const Configs: unknown = allConfig.get<unknown>('hashToolkitConfig');
    if (!Array.isArray(Configs)) {
        vscode.window.showErrorMessage(`${name}.hashToolkitConfig should be an array`);
        return;
    }

    for (const config of Configs) {
        const c = safeParserConfig0(config);
        if (!c.success) {
            vscode.window.showErrorMessage(`${name}.hashToolkitConfig some config is invalid`);
            const md = [
                '# input config',
                '',
                '```json',
                JSON.stringify(config, null, 2),
                '```',
                '',
                '# error',
                '',
                '```json',
                JSON.stringify(c, null, 2),
                '```',
            ].join('\n');

            openAndShow('markdown', md);
            return;
        }
    }

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
    ];

    const { json, md } = await getHashCore(select, blockList, 'md5');

    await Promise.all([
        openAndShow('jsonc', json),
        openAndShow('markdown', md),
    ]);
}
