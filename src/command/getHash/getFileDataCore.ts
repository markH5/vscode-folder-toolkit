/* eslint-disable prefer-template */
import type { Buffer } from 'node:buffer';
import type { Stats } from 'node:fs';
import type { ReadonlyDeep } from 'type-fest';
import type { THashConfig } from '../../config.hash';
import type { THash } from '../../config.hash.internal';
import type { TErrorLog, TProgress, TToken } from './def';
import { createHash } from 'node:crypto';
import { createReadStream, statSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { chunk } from 'es-toolkit';
import { fmtFileSize } from './fmtFileSize';

function logErr(errLog: TErrorLog, e: unknown, fsPath: string): string {
    // https://stackoverflow.com/questions/8965606/node-and-error-emfile-too-many-open-files
    // or heap out of memory (OOM)
    const k: string = typeof e === 'object' && e !== null && 'code' in e && typeof e.code === 'string'
        ? e.code
        : 'unknown';
    const arr = errLog[k] ?? [];
    arr.push({ fsPath, error: e });
    errLog[k] = arr;
    return 'Error: ' + k;
}

async function get_file_hash_stream(fsPath: string, fn: THash, errLog: TErrorLog): Promise<string> {
    return new Promise((resolve) => {
        const hash = createHash(fn);
        const rs = createReadStream(fsPath);
        rs.on('data', (chunk) => hash.update(chunk));
        rs.on('end', () => {
            resolve(hash.digest('hex'));
        });
        rs.on('error', (e) => resolve(logErr(errLog, e, fsPath)));
    });
}

async function get_file_hash(fsPath: string, fn: THash, errLog: TErrorLog): Promise<string> {
    try {
        const b: Buffer<ArrayBufferLike> = await readFile(fsPath); // node:fs
        const need: string = createHash(fn) // node:crypto
            .update(b)
            .digest('hex');
        return need;
    } catch (e: unknown) {
        return logErr(errLog, e, fsPath);
    }
}

export type TReport = ReadonlyDeep<{
    path: string,
    size: string,
    Bytes: number,
    // mTime: string,
    hash: {
        k: THash,
        v: string,
    },
}>;

async function creatTF(fsPath: string, fn: THash, errLog: TErrorLog): Promise<TReport> {
    const stat: Stats = statSync(fsPath);
    const Bytes: number = stat.size;
    // const mTime: string = stat.mtime.toISOString();
    const size: string = fmtFileSize(Bytes, 2);
    const hash: string = Bytes > 16 * (1024 ** 2) // 16 MB 10 MiB https://medium.com/@dalaidunc/fs-readfile-vs-streams-to-read-text-files-in-node-js-5dd0710c80ea
        ? await get_file_hash_stream(fsPath, fn, errLog)
        : await get_file_hash(fsPath, fn, errLog);
    return ({
        path: fsPath,
        size,
        Bytes,
        // mTime,
        hash: { k: fn, v: hash },
    });
}

async function getFileDataCore(filePaths: readonly string[], fn: THash, errLog: TErrorLog): Promise<readonly TReport[]> {
    const d1 = filePaths
        .map(async (fsPath: string): Promise<TReport> => (creatTF(fsPath, fn, errLog)));

    const need: readonly TReport[] = await Promise.all(d1);
    return need;
}

export async function getFileDataCoreEx(
    filePaths: readonly string[],
    selectConfig: THashConfig,
    errLog: TErrorLog,
    progress: TProgress,
    token: TToken,
): Promise<readonly TReport[]> {
    const { fn, maxOpenFiles } = selectConfig;
    const arr1: string[][] = chunk(filePaths, maxOpenFiles); // 10240 - 20
    const need: TReport[] = [];

    for (const arr of arr1) {
        const a: readonly TReport[] = await getFileDataCore(arr, fn, errLog);
        need.push(...a);
        const total: number = Math.round((need.length / filePaths.length) * 100);

        let message: string = `${need.length} / ${filePaths.length} ( ${total}%)`;
        if (Object.keys(errLog).length > 0) {
            let errSize = 0;
            for (const arr of Object.values(errLog)) {
                errSize += arr.length;
            }
            message += `[error ${errSize}]`;
        }

        progress.report({ message, increment: Math.floor(a.length * 100 / filePaths.length) });
        if (token.isCancellationRequested) {
            return need;
        }
    }

    return need;
}
