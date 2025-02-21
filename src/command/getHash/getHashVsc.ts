import type { TBlockRuler, THashConfig } from '../../configUI.data';
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

async function getConfig(): Promise<THashConfig | undefined> {
    const allConfig = vscode.workspace.getConfiguration(name);
    const section = 'hashToolkitConfig';
    const Configs: unknown = allConfig.get<unknown>(section);
    if (!Array.isArray(Configs)) {
        vscode.window.showErrorMessage(`${name}.${section} should be an array`);
        return;
    }

    for (const config of Configs) {
        const c = safeParserConfig0(config);
        if (!c.success) {
            vscode.window.showErrorMessage(`${name}.${section} some config is invalid`);
            openAndShow('json', JSON.stringify(c.issues, null, 2));
            return;
        }
    }

    type TItem = { label: string, v: THashConfig };
    const items: TItem[] = Configs.map((v: THashConfig): TItem => ({ label: `${v.name}(${v.fn}/${v.report})`, v }));
    const config: TItem | undefined = await vscode.window.showQuickPick(items, { title: 'report style' });
    if (config === undefined) return;
    return structuredClone(config.v);
}

export async function getHashVsc(_file: vscode.Uri, selectedFiles: vscode.Uri[]): Promise<void> {
    const select: readonly string[] = selectedFiles.map((u): string => u.fsPath.replaceAll('\\', '/'));

    const config: THashConfig | undefined = await getConfig();
    if (config === undefined) return;

    const { blockList, fn, report } = config;
    const blockListRun: readonly TBlockRuler[] = blockList.map((r): TBlockRuler => ({ name: r.name, reg: new RegExp(r.reg, 'u') }));

    const { json, md } = await getHashCore(select, blockListRun, fn);

    const arr: Promise<vscode.TextEditor>[] = [];
    if (report === 'json' || report === 'both') arr.push(openAndShow('jsonc', json));
    if (report === 'md' || report === 'both') arr.push(openAndShow('markdown', md));

    await Promise.all(arr);
}
