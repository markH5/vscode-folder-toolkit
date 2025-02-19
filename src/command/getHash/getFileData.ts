/* eslint-disable node/prefer-global/buffer */
import type { Stats } from 'node:fs';
import type { ReadonlyDeep } from 'type-fest';
import { createHash } from 'node:crypto';
import { statSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
// import { crc32 } from '@node-rs/crc32';
// import { xxh32, xxh64 } from '@node-rs/xxhash';
import { fmtFileSize } from './fmtFileSize';

export type THash =
    // @node-rs/
    // | 'crc32'
    // | 'xxh64'
    // | 'xxh32'
    // node:crypto
    | 'sha1'
    | 'sha256'
    | 'md5';

function ndoeCrypto(s: Buffer<ArrayBufferLike>, fn: string): string {
    return createHash(fn)
        .update(s)
        .digest('hex');
}

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
        return ndoeCrypto(s, fn);
    } catch (error) {
        console.error('get hash error', error);
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

export async function getFileData(fileList: readonly string[], fn: THash): Promise<readonly TF[]> {
    const d1: Promise<TF>[] = fileList.map(
        async (fsPath: string): Promise<TF> => {
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
        },
    );

    const d2: readonly TF[] = await Promise.all(d1);
    return d2;
}
