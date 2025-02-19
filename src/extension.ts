import * as vscode from 'vscode';
import { ECommand } from './command/ECommand';
import { getHashVsc } from './command/getHash/getHashVsc';

export function activate(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
        vscode.commands.registerCommand(ECommand.getHash, getHashVsc),
    );
}

export function deactivate(): void {}
