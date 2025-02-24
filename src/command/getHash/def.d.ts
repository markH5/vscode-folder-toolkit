import type * as vscode from 'vscode';

export type TProgress = vscode.Progress<{
    message: string,
    increment: number,
}>;

export type TToken = vscode.CancellationToken;
