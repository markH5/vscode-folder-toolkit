import { writeFileSync } from 'node:fs';
import * as vscode from 'vscode';
import { fmtFileSize } from './fmtFileSize';

export async function openAndShow(language: 'json' | 'markdown', content: string): Promise<void> {
    if (content.length >= 1024 ** 2) { // 1 MiB
        // js str is utf-16 le
        // cover to utf-8 size
        const message: string = `(~= ${fmtFileSize(content.length, 2)} ${language}) Because the file is >= 1MiB, it cannot be previewed. Please save it before opening it.`;
        await vscode.window.showWarningMessage(message);

        const filters: { [name: string]: string[] } = language === 'json'
            ? { 'json': ['json', 'jsonc'] }
            : { 'markdown': ['md'] };
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
