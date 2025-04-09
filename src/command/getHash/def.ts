import type * as vscode from 'vscode';
import type { TReport } from './getFileDataCore';

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

export type TStatistics = {
    msg: string,
    report: Record<string, string[]>,
};

export type TJSON = {
    header: unknown,
    body: {
        datas: readonly TReport[],
        statistics: TStatistics,
    },
    footer: unknown,
};
