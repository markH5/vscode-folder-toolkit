/* eslint-disable node/prefer-global/buffer */
import { createHash } from 'node:crypto';
import { statSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { crc32 } from '@node-rs/crc32';
import { xxh32, xxh64 } from '@node-rs/xxhash';
import { fmtFileSize } from './fmtFileSize';

export type THash =
    // node/rs
    | 'crc32'
    | 'xxh64'
    | 'xxh32'
    // @node-rs/
    | 'sha1'
    | 'sha256'
    | 'md5';

// 7z
// Supported methods: CRC32, CRC64, MD5, SHA1, SHA256, SHA384, SHA512, SHA3 - 256, XXH64, BLAKE2sp.Default method is CRC32.

function ndoeCrypto(s: Buffer<ArrayBufferLike>, fn: string): string {
    return createHash(fn)
        .update(s)
        .digest('hex');
}

function fmtHexStr(hash: number | bigint, minLen: number): string {
    return hash
        .toString(16)
        .toUpperCase()
        .padStart(minLen, '0');
}

async function get_file_hash(fsPath: string, fn: THash): Promise<string> {
    try {
        const s: Buffer<ArrayBufferLike> = await readFile(fsPath);
        if (fn === 'xxh64') return fmtHexStr(xxh64(s), 16);
        if (fn === 'xxh32') return fmtHexStr(xxh32(s), 8);
        if (fn === 'crc32') return fmtHexStr(crc32(s), 8);
        return ndoeCrypto(s, fn);
    } catch (error) {
        console.error('get hash error', error);
        return 'get hash error';
    }
}

export async function getFileData(fileList: readonly string[], fn: THash): Promise<(
    {
        path: string,
        size: string,
        Bytes: number,
        hash: {
            k: THash,
            v: string,
        },
    }
)[]> {
    const d1 = fileList.map(
        async (fsPath: string) => {
            const Bytes: number = statSync(fsPath).size;
            const size: string = fmtFileSize(Bytes, 2);
            const hash: string = await get_file_hash(fsPath, fn);
            return ({
                path: fsPath,
                size,
                Bytes,
                hash: { k: fn, v: hash },
            });
        },
    );

    const d2 = await Promise.all(d1);
    return d2;
}
