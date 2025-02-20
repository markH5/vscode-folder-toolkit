/* eslint-disable node/prefer-global/buffer */
import type { Stats } from 'node:fs';
import type { ReadonlyDeep } from 'type-fest';
import { createHash } from 'node:crypto';
import { statSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { chunk } from 'es-toolkit';
import { fmtFileSize } from './fmtFileSize';

// import { crc32 } from '@node-rs/crc32';
// import { xxh32, xxh64 } from '@node-rs/xxhash';

export type THash =
    // @node-rs/
    // | 'crc32'
    // | 'xxh64'
    // | 'xxh32'
    // node:crypto
    | 'sha1'
    | 'sha256'
    | 'md5';

// function fmtHexStr(hash: number | bigint, minLen: number): string {
//     return hash
//         .toString(16)
//         .toUpperCase()
//         .padStart(minLen, '0');
// }

async function get_file_hash(fsPath: string, fn: THash): Promise<string> {
    try {
        const s: Buffer<ArrayBufferLike> = await readFile(fsPath);
        // if (fn === 'xxh64') return fmtHexStr(xxh64(s), 16);
        // if (fn === 'xxh32') return fmtHexStr(xxh32(s), 8);
        // if (fn === 'crc32') return fmtHexStr(crc32(s), 8);
        return createHash(fn)
            .update(s)
            .digest('hex');
    } catch {
        return 'get hash error';
    }
}

export type TF = ReadonlyDeep<{
    path: string,
    size: string,
    Bytes: number,
    mTime: string,
    hash: {
        k: THash,
        v: string,
    },
}>;

async function creatTF(fsPath: string, fn: THash): Promise<TF> {
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

/**
 * @param filePaths readonly string[]
 * @param fn {THash}
 * @returns Promise<readonly TF[]>
 */
async function getFileDataCore(filePaths: readonly string[], fn: THash): Promise<readonly TF[]> {
    const d1 = filePaths
        .map(async (fsPath: string): Promise<TF> => (creatTF(fsPath, fn)));

    const need: readonly TF[] = await Promise.all(d1);
    return need;
}

export async function getFileDataCoreEx(filePaths: readonly string[], fn: THash): Promise<readonly TF[]> {
    const arr1: string[][] = chunk(filePaths, 10230); // 10240 - 20
    const need: TF[] = [];

    for (const arr of arr1) {
        const a: readonly TF[] = await getFileDataCore(arr, fn);
        need.push(...a);
    }

    return need;
}
