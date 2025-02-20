import type { Buffer } from 'node:buffer';
import type { Stats } from 'node:fs';
import type { ReadonlyDeep } from 'type-fest';
import type { THash } from '../../configUI.data';
import { createHash } from 'node:crypto';
import { statSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { chunk } from 'es-toolkit';
import { fmtFileSize } from './fmtFileSize';

async function get_file_hash(fsPath: string, fn: THash): Promise<string> {
    try {
        const b: Buffer<ArrayBufferLike> = await readFile(fsPath);
        const need: string = createHash(fn)
            .update(b)
            .digest('hex');
        return need;
    } catch {
        return 'get hash error';
    }
}

export type TReport = ReadonlyDeep<{
    path: string,
    size: string,
    Bytes: number,
    mTime: string,
    hash: {
        k: THash,
        v: string,
    },
}>;

async function creatTF(fsPath: string, fn: THash): Promise<TReport> {
    const stat: Stats = statSync(fsPath);
    const Bytes: number = stat.size;
    const mTime: string = stat.mtime.toISOString();
    const size: string = fmtFileSize(Bytes, 2);
    const hash: string = await get_file_hash(fsPath, fn);
    return ({
        path: fsPath,
        size,
        Bytes,
        mTime,
        hash: { k: fn, v: hash },
    });
}

async function getFileDataCore(filePaths: readonly string[], fn: THash): Promise<readonly TReport[]> {
    const d1 = filePaths
        .map(async (fsPath: string): Promise<TReport> => (creatTF(fsPath, fn)));

    const need: readonly TReport[] = await Promise.all(d1);
    return need;
}

export async function getFileDataCoreEx(filePaths: readonly string[], fn: THash): Promise<readonly TReport[]> {
    const arr1: string[][] = chunk(filePaths, 10230); // 10240 - 20
    const need: TReport[] = [];

    for (const arr of arr1) {
        const a: readonly TReport[] = await getFileDataCore(arr, fn);
        need.push(...a);
    }

    return need;
}
