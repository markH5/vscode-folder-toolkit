import type { TBlock } from '../../config.hash';
import type { TBlockRuler } from '../../config.hash.internal';
import type { TImg2webp_config } from '../../config/img2webp.def';
import type { TProgress, TToken } from '../getHash/def';
import * as vscode from 'vscode';
import { name } from '../../../package.json';
import { safeParserConfig_1 } from '../../config/img2webps.chema';
import { openAndShow } from '../getHash/openAndShow';
import { img2webpCore } from './img2webpCore';

async function getConfig(): Promise<TImg2webp_config | undefined> {
    const allConfig = vscode.workspace.getConfiguration(name);
    const section = 'img2webp';
    const Configs: unknown = allConfig.get<unknown>(section);
    if (!Array.isArray(Configs)) {
        vscode.window.showErrorMessage(`${name}.${section} should be an array`);
        return;
    }

    for (const config of Configs) {
        const c = safeParserConfig_1(config);
        if (!c.success) {
            vscode.window.showErrorMessage(`${name}.${section} some config is invalid`);
            // openAndShow('json', JSON.stringify(c.issues, null, 2));
            return;
        }
    }

    type TItem = { label: string, v: TImg2webp_config };
    const items: TItem[] = Configs.map((v: TImg2webp_config): TItem => ({ label: v.name, v }));
    const config: TItem | undefined = await vscode.window.showQuickPick(items, { title: 'select option' });
    if (config === undefined) return;
    return structuredClone(config.v);
}

export async function img2webp(_file: vscode.Uri, selectedFiles: vscode.Uri[]): Promise<void> {
    const select: readonly string[] = selectedFiles.map((u): string => u.fsPath.replaceAll('\\', '/'));

    const selectConfig: TImg2webp_config | undefined = await getConfig();
    if (selectConfig === undefined) return;

    const { blockList } = selectConfig;
    const blockListRun: readonly TBlockRuler[] = blockList
        .map((r: TBlock): TBlockRuler => ({ name: r.name, reg: new RegExp(r.reg, r.flag) }));

    vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: 'img2webp',
            cancellable: true,
        },
        async (progress: TProgress, token: TToken) => {
            token.onCancellationRequested((): void => {
                vscode.window.showInformationMessage('task is cancel');
            });
            const ans: string = await img2webpCore(
                select,
                blockListRun,
                selectConfig,
                progress,
                token,
            );
            openAndShow('json', ans);

            progress.report({ message: 'finish', increment: 100 });
            //   vscode.window.showInformationMessage('task is finish');
        },
    );
}
