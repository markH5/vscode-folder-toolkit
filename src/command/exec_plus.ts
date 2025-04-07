/* eslint-disable sonarjs/os-command */
import type { ChildProcess, ExecException } from 'node:child_process';
import { exec } from 'node:child_process';

export async function exec_plus(cmd: string, task_name: string, show_std_out = false): Promise<number> {
    return new Promise((resolve) => {
        const t1: number = Date.now();
        const child: ChildProcess = exec(cmd, { timeout: 0, windowsHide: true }, (error: ExecException | null, stdout: string, stderr: string): void => {
            if (error !== null) console.error('Failed to execute command:', error);
            if (stderr !== '') console.error('stderr:', stderr);
            if (show_std_out) console.log('stdout', stdout);
        });
        child.on('exit', (code: number): void => {
            console.log('exit code:', code, '\tuse: ', Date.now() - t1, 'ms', `\ttask_name: ${task_name}`);
            resolve(code);
            // ^^^^^
        });
    });
}
