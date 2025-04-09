import type { THashConfig } from '../../config.hash';
import type { TBlockRuler } from '../../config.hash.internal';
import type { TProgress, TToken } from './def';
import type { THashReport } from './getHashCore';
import * as vscode from 'vscode';
import { name } from '../../../package.json';
import { safeParserConfig0 } from '../../config.hash.schema';
import { getHashCore } from './getHashCore';
import { json2md } from './json2md';
import { openAndShow } from './openAndShow';

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
            openAndShow('json', JSON.stringify(c.issues, null, '\t'));
            return;
        }
    }

    type TItem = {
        label: string,
        v: THashConfig,
    };
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
        .map((reg: string): TBlockRuler => ({ name: reg, reg: new RegExp(reg) }));

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
                openAndShow('json', JSON.stringify(json, null, '\t'));
            }

            if (report === 'md' || report === 'both') {
                openAndShow('markdown', json2md(ans.json));
            }

            if (Object.keys(ans.errLog).length > 0) {
                const { errLog } = ans;
                ans.errLog = {};
                openAndShow('json', JSON.stringify(errLog, null, '\t'));
            }

            progress.report({ message: 'finish', increment: 100 });
            //   vscode.window.showInformationMessage('task is finish');
        },
    );
}
