/* eslint-disable node/prefer-global/buffer */
import { statSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { xxh32, xxh64 } from '@node-rs/xxhash';
import { fmtFileSize } from './fmtFileSize';

export type THash =
    | 'crc32'
    | 'xxh64'
    | 'xxh32'
    | 'md5';

function fmtHexStr(hash: number | bigint): string {
    const hex: string = hash.toString(16).toUpperCase();
    return hex.length % 2 === 0
        ? hex
        : `0${hex}`;
}

async function get_file_hash<T extends THash>(fsPath: string, fn: T): Promise<string> {
    try {
        const s: Buffer<ArrayBufferLike> = await readFile(fsPath);
        if (fn === 'xxh64') return fmtHexStr(xxh64(s));
        if (fn === 'xxh32') return fmtHexStr(xxh32(s));

        return 'this method is not provided';
    } catch (error) {
        console.error('get hash error', error);
        return 'get hash error';
    }
}

export async function getFileData<T extends THash>(fileList: readonly string[], fn: T): Promise<(
    {
        path: string,
        size: string,
        Bytes: number,
        hash: {
            k: THash,
            v: string;
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
