import type { TF } from './getFileDataCore';

type TJSON = {
    header: unknown,
    body: unknown,
    footer: unknown,
};

export function json2md(datas: readonly TF[], json: TJSON): string {
    const arr: string[] = [
        '## head ',
        '',
        '```json',
        JSON.stringify(json.header, null, 4),
        '```',
        '',
        '## body ',
        '',
    ];

    const ln1: number = Math.max(...datas.map((v: TF): number => v.path.length));
    const ln2: number = Math.max(...datas.map((v: TF): number => v.size.length));
    const ln3: number = Math.max(...datas.map((v: TF): number => v.Bytes.toString().length));
    const ln4: number = datas[0].hash.v.length;
    const ln5: number = datas[0].mTime.length;
    {
        const a1: string = 'path'.padEnd(ln1);
        const a2: string = 'size'.padStart(ln2);
        const a3: string = 'Bytes'.padStart(ln3);
        const a4: string = `hash(\`${datas[0].hash.k}\`)`.padStart(ln4 + 2); // warp with "``".len === 2
        const a5: string = 'mTime'.padStart(ln5);
        const n1: string = ':-'.padEnd(ln1, '-');
        const n2: string = '-:'.padStart(ln2, '-');
        const n3: string = '-:'.padStart(ln3, '-');
        const n4: string = '-:'.padStart(ln4 + 2, '-');
        const n5: string = '-:'.padStart(ln5, '-');
        arr.push(
            '',
            // `| path | size | Bytes | hash(`xxh64`) | mitime |`,
            // `| :--- | ---: | -----: | ---: | ---: |`,
            `| ${a1} | ${a2} | ${a3} | ${a4} | ${a5} |`,
            `| ${n1} | ${n2} | ${n3} | ${n4} | ${n5} |`,
        );
    }

    for (const d of datas) {
        const { path, size, Bytes, hash, mTime } = d;
        const c1: string = path.padEnd(ln1);
        const c2: string = size.padStart(ln2);
        const c3: string = Bytes.toString().padStart(ln3);
        const c4: string = `\`${hash.v}\``;
        const c5: string = mTime;
        arr.push(
            `| ${c1} | ${c2} | ${c3} | ${c4} | ${c5} |`,
        );
    }

    arr.push(
        '',
        '## footer ',
        '',
        '```json',
        JSON.stringify(json.footer, null, 4),
        '```',
    );

    return arr.join('\n');
}
