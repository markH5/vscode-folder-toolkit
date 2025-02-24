import type { TBlock, TBlockRuler, THashConfig } from '../../configUI.data';
import type { TProgress, TToken } from './def';
import type { THashReport } from './getHashCore';
import { writeFileSync } from 'node:fs';
import * as vscode from 'vscode';
import { name } from '../../../package.json';
import { safeParserConfig0 } from '../../configUI';
import { fmtFileSize } from './fmtFileSize';
import { getHashCore } from './getHashCore';

async function openAndShow(language: 'json' | 'markdown', content: string): Promise<void> {
    if (content.length >= 1024 ** 2) { // 1 MiB
        // js str is utf-16 le
        // cover to utf-8 size
        const message: string = `(~= ${language}) ${fmtFileSize(content.length, 2)}. Because the file is >= 1MiB, it cannot be previewed. Please save it before opening it.`;
        await vscode.window.showWarningMessage(message);

        const filters: { [name: string]: string[] } = language === 'json'
            ? {
                'json': ['json', 'jsonc'],
            }
            : {
                'markdown': ['md'],
            };
        const uri: vscode.Uri | undefined = await vscode.window.showSaveDialog({ filters, saveLabel: 'saveLabel' });
        if (uri === undefined) return;
        writeFileSync(uri.fsPath, content, 'utf8');
        // await vscode.workspace.fs.writeFile(uri, new TextEncoder().encode(content));
        // vscode.window.showTextDocument(fileUri, { preview: false });
    } else {
        const doc: vscode.TextDocument = await vscode.workspace.openTextDocument({ language, content });
        await vscode.window.showTextDocument(doc);
    }

    // // i want this api
    // // https://github.com/microsoft/vscode/issues/136927
    // return textEditor;
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

    const selectConfig: THashConfig | undefined = await getConfig();
    if (selectConfig === undefined) return;

    const { blockList } = selectConfig;
    const blockListRun: readonly TBlockRuler[] = blockList
        .map((r: TBlock): TBlockRuler => ({ name: r.name, reg: new RegExp(r.reg, r.flag) }));

    vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: 'calc hash',
            cancellable: true,
        },
        async (progress: TProgress, token: TToken) => {
            token.onCancellationRequested((): void => {
                vscode.window.showInformationMessage('task is cancel');
            });
            const ans: THashReport = await getHashCore(
                select,
                blockListRun,
                selectConfig,
                progress,
                token,
            );

            const { report } = selectConfig;
            if (report === 'json' || report === 'both') {
                const { json } = ans;
                ans.json = '';
                openAndShow('json', json);
            }
            if (report === 'md' || report === 'both') {
                const { md } = ans;
                ans.md = '';
                openAndShow('markdown', md);
            }

            if (Object.keys(ans.errLog).length > 0) {
                const { errLog } = ans;
                ans.errLog = {};
                openAndShow('json', JSON.stringify(errLog, null, 4));
            }

            progress.report({ message: 'finish', increment: 100 });
            //   vscode.window.showInformationMessage('task is finish');
        },
    );
}
