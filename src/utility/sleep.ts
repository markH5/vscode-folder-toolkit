// eslint-disable no-await-in-loop
export function sleep(ms: number): Promise<void> {
    return new Promise((reslove): void => {
        setTimeout(reslove, ms);
    });
}

export async function sleepEx(ms: number): Promise<void> {
    const t1: number = Date.now() + ms;

    //
    await sleep(ms);
    while (true) {
        const t2: number = Date.now();
        if (t2 > t1) return;
        const diff: number = t1 - t2;
        await sleep(diff);
    }
}
