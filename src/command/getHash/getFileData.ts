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

async function get_file_hash<T extends THash>(fsPath: string, fn: T): Promise<string> {
    try {
        const s: Buffer<ArrayBufferLike> = await readFile(fsPath);
        if (fn === 'xxh64') {
            const hash = xxh64(s);
            return hash.toString(16).toUpperCase();
        }
        if (fn === 'xxh32') {
            const hash = xxh32(s);
            return hash.toString(16).toUpperCase();
        }

        const hash = xxh64(s);
        return hash.toString(16).toUpperCase();
    } catch (error) {
        console.error('get hash error', error);
        return 'get hash error';
    }
}

export async function getFileData<T extends THash>(fileList: readonly string[], fn: T): Promise<(
    {
        path: string,
        size: string,
        sizeRaw: number,
        hash: {
            [key in THash]?: string;
        }[],
    }
)[]> {
    const d1 = fileList.map(
        async (fsPath: string) => {
            const sizeRaw: number = statSync(fsPath).size;
            const size: string = fmtFileSize(sizeRaw, 2);

            const hash: string = await get_file_hash(fsPath, fn);
            return ({
                path: fsPath,
                size,
                sizeRaw,
                hash: [
                    { [fn]: hash },
                ],
            });
        },
    );

    const d2 = await Promise.all(d1);
    return d2;
}
