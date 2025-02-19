import type { TF, THash } from './getFileDataCore';

import { cpus } from 'node:os';
import { join } from 'node:path/posix';
import { Worker } from 'node:worker_threads';
import { chunk } from 'es-toolkit';
import { getFileDataCore } from './getFileDataCore';

export async function getFileDataMore(filePaths: readonly string[], fn: THash): Promise<readonly TF[]> {
    const WorkerPath = join(__dirname, './getFileDataCore.js');

    if (filePaths.length < 1024) return getFileDataCore(filePaths, fn);

    const numThreads: number = Math.max(cpus().length - 1, 1); // 假设有16个工作线程
    const core999 = Math.ceil((filePaths.length / numThreads));
    const arr1: string[][] = chunk(filePaths, core999);

    const foo: Record<number, any> = {};
    const pList: Promise<any>[] = [];
    for (const [i, arr] of arr1.entries()) {
        const p = new Promise<string>((resolve, reject) => {
            const worker = new Worker(WorkerPath, {
                workerData: i,
            });

            worker.on('message', (result) => {
                //   console.log(`Fibonacci result from thread ${i}: ${result}`);
                foo[i] = JSON.parse(result);
                resolve(result);
            });
            worker.on('exit', (exitCode) => {
                console.warn(i, "🚀 ~ exit", exitCode);
            });
            worker.on('error', (error) => {
                console.error(i, "🚀 ~ error", error);
                reject(error);
            });

            worker.postMessage(JSON.stringify({ i, filePaths: arr, fn })); // 计算斐波那契数列的第40项
        });

        pList.push(p);
    }

    await Promise.all(pList);

    const need: TF[] = [];

    for (const [k, v] of Object.entries(foo)) {
        const v2 = v.data as TF[];
        try {
            need.push(...v2);
        } catch (error) {
            console.log("🚀 ~ error-60", error);
        }
    }

    {
        const k1 = filePaths.join("\n");
        const k2 = need.map((v) => v.path).join("\n");
        console.log("🚀 ~ -61", k1 === k2);

    }

    return need;
}
