import { existsSync } from 'node:fs';
import * as vscode from 'vscode';
import { name } from '../../../package.json';
import { N } from '../../fsTools/N';
import { openAndShow } from '../share/openAndShow';

export function get_cwebp_Path(): string | undefined {
    const allConfig: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(name);
    const section = 'cwebp_Path';
    const full_key = `${name}.${section}`;
    const Configs: unknown = allConfig.get<unknown>(section);
    if (!Array.isArray(Configs)) {
        vscode.window.showErrorMessage(`${full_key} should be an array`);
        return;
    }

    const md: string[] = [];
    for (const path_raw of Configs) {
        if (typeof path_raw !== 'string') {
            md.push(
                '',
                `"${full_key}" should be an array of strings`,
                '',
            );
            break;
        }
        const path: string = N(path_raw);
        if (existsSync(path)) {
            return path;
        }
    }

    vscode.window.showErrorMessage(`${full_key} not found the cwebp`);

    md.push(
        '# settings error',
        '',
        '1. open [webp](https://developers.google.com/speed/webp/download)',
        '2. Download for your os',
        `3. open the [settings.json](vscode://settings/${full_key})`,
        // 3. open the [settings.json](vscode://settings/vscode-folder-toolkit.cwebp_Path)
        '4. setting your path',
        '',
        '```jsonc',
        '// settings.json',
        '{',
        `    "${full_key}": [`, //     "vscode-folder-toolkit.cwebp_Path": [
        '        "C:/<your_path>/libwebp/bin/cwebp.exe", // windows os style',
        '        "/usr/bin/<your_libwebp>/bin/cwebp", // linux/mac os style',
        '        "/usr/local/bin/<your_libwebp>/bin/cwebp", // Multiple versions can be filled to facilitate users of multiple OS',
        '        "/usr/local/Cellar/<your_libwebp>/1.5.0/bin/cwebp"',
        '    ]',
        '}',
        '```',
        '',
    );

    openAndShow('markdown', md.join('\n'));
    return undefined;
}
