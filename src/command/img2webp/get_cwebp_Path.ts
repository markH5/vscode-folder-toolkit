import { existsSync } from 'node:fs';
import * as vscode from 'vscode';
import { name } from '../../../package.json';
import { N } from '../../fsTools/N';
import { openAndShow } from '../getHash/openAndShow';

export function get_cwebp_Path(): string | undefined {
    const allConfig: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(name);
    const section = 'cwebp_Path';
    const full_key = `${name}.${section}`;
    const Configs: unknown = allConfig.get<unknown>(section);
    if (!Array.isArray(Configs)) {
        vscode.window.showErrorMessage(`${full_key} should be an array`);
        return;
    }

    for (const path_raw of Configs) {
        if (typeof path_raw !== 'string') {
            vscode.window.showErrorMessage(`${full_key} should be an array of strings`);
            return;
        }
        const path: string = N(path_raw);
        if (existsSync(path)) {
            return path;
        }
    }

    vscode.window.showErrorMessage(`${full_key} not found any cwebp`);

    const jsocStr: string = JSON.stringify({ [`${full_key}`]: Configs }, null, 2);
    const md: string[] = [
        '# settings error',
        '',
        'download [webp](https://developers.google.com/speed/webp/download) && set the path here.',
        '',
        `> open your [settings.json](vscode://settings/${full_key})`,
        '',
        '```jsonc',
        '// settings.json',
        jsocStr,
        '```',
        '',
        '## search list',
        '',
    ];
    for (const [i, path_raw] of Configs.entries()) {
        const path: string = N(path_raw);
        md.push(
            '',
            `### path ${i}`,
            '',
            `> raw_input \`${path_raw}\``,
            '',
            // - [X] exit false `C:/Users/user/bin/libwebp/libwebp-1.5.0-windows-x64/bin/cwebp.exe`
            // - [X] exit false `C:/Users/user/bin/libwebp/libwebp-1.5.0-windows-x64/bin`
            // - [X] exit false `C:/Users/user/bin/libwebp/libwebp-1.5.0-windows-x64`
            // - [X] exit false `C:/Users/user/bin/libwebp`
            // - [X] exit false `C:/Users/user/bin`
            // - [O] exit true `C:/Users/user`
            // - [O] exit true `C:/Users`
            // - [O] exit true `C:/`
        );
        //
        let pa = '';
        for (const [j, s] of N(path).split('/').entries()) {
            if (j === 0) {
                pa = s;
                continue;
            }
            pa = `${pa}/${s}`;
            const iseEists: boolean = existsSync(pa);
            const prefix: string = iseEists
                ? '- [O] exit true'
                : '- [X] exit false';
            const line_str: string = `${prefix} [path_${j}](${pa})`;

            md.push(line_str);
        }
    }

    openAndShow('markdown', md.join('\n'));
    return undefined;
}
