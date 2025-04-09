import type * as vscode from 'vscode';

export type TProgress = vscode.Progress<{
    message: string,
    increment: number,
}>;

export type TToken = vscode.CancellationToken;

type TErrMsg = {
    fsPath: string,
    error: unknown,
};

export type TErrorLog = Record<string, TErrMsg[]>;

export type TJSON = {
    header: unknown,
    body: {
        datas: readonly TReport[],
    },
    footer: unknown,
};
