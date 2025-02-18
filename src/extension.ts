import * as vscode from 'vscode';
import { ECommand } from './command/ECommand';
import { getHash } from './command/getHash/getHash';

export function activate(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
        vscode.commands.registerCommand(ECommand.getHash, getHash),
    );
}

export function deactivate(): void {}
