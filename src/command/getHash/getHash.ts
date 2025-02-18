import { normalize } from 'node:path/posix';
import * as vscode from 'vscode';
import { getfsPathList } from '../../fsTools/getUriList';
import { sum } from '../../Math/sum';
import { fmtFileSize } from './fmtFileSize';
import { getFileData } from './getFileData';

export async function getHash(_file: vscode.Uri, selectedFiles: vscode.Uri[]): Promise<void> {
    //

    const t1 = Date.now();
    const blockList: readonly RegExp[] = [
        /\/\.svn\//u,
        /\/\.git\//u,
        /\/node_modules\//u,
    ];
    const select: readonly string[] = selectedFiles
        .map((u): string => normalize(u.fsPath).replaceAll('\\', '/'));

    const search: readonly string[] = getfsPathList(select, blockList);
    // if search > 50 show 


    const data = await getFileData(search, 'xxh64');

    const l = data.map(v => v.sizeRaw);
    const totalSize: string = fmtFileSize(sum(l), 2);
    const totalFile = l.length;
    const t2 = Date.now();
    const useMs = t2 - t1;

    const docOut: vscode.TextDocument = await vscode.workspace.openTextDocument({
        language: 'jsonc',
        content: JSON.stringify(
            [
                {
                    head: {
                        comment: [
                            '0. 備註 XXX',
                        ],
                        select,
                    },
                    body: {
                        search,
                        data,
                    },
                    footer: {
                        useMs,
                        totalSize,
                        totalFile
                    }
                },
            ],
            null,
            4,
        ),
    });
    await vscode.window.showTextDocument(docOut);
}
