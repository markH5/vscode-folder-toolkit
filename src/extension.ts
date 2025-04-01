import * as vscode from 'vscode';
import { ECommand } from './command/ECommand';
import { getHashVsc } from './command/getHash/getHashVsc';
import { img2webp } from './command/img2webp/img2webp';

export function activate(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
        vscode.commands.registerCommand(ECommand.getHash, getHashVsc),
        vscode.commands.registerCommand(ECommand.img2webp, img2webp),
    );
}

export function deactivate(): void {}
