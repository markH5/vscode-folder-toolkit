import type { TJSON } from './def';
import type { TReport } from './getFileDataCore';

export function json2md(json: TJSON): string {
    const { datas, statistics } = json.body;

    const arr: string[] = [
        '## head ',
        '',
        '```json',
        JSON.stringify(json.header, null, '\t'),
        '```',
        '',
        '## body ',
        '',
        '### datas',
        '',
    ];

    const ln0: number = datas[0].hash.v.length;
    const ln1: number = Math.max(...datas.map((v: TReport): number => v.size.length));
    const ln2: number = Math.max(...datas.map((v: TReport): number => v.Bytes.toString().length));
    const ln3: number = Math.max(...datas.map((v: TReport): number => v.path.length));

    {
        const a0: string = `hash(\`${datas[0].hash.k}\`)`.padStart(ln0);
        const a1: string = 'size'.padStart(ln1);
        const a2: string = 'Bytes'.padStart(ln2);
        const a3: string = 'path'.padEnd(ln3);

        const n0: string = '-:'.padStart(ln0, '-');
        const n1: string = '-:'.padStart(ln1, '-');
        const n2: string = '-:'.padStart(ln2, '-');
        const n3: string = ':-'.padEnd(ln3, '-');

        arr.push(
            '',
            `| ${a0} | ${a1} | ${a2} | ${a3} |`,
            `| ${n0} | ${n1} | ${n2} | ${n3} |`,
        );
    }

    for (const d of datas) {
        const { path, size, Bytes, hash } = d;
        const c0: string = hash.v;
        const c1: string = size.padStart(ln1);
        const c2: string = Bytes.toString().padStart(ln2);
        const c3: string = path.padEnd(ln3);

        arr.push(
            `| ${c0} | ${c1} | ${c2} | ${c3} |`,
        );
    }

    arr.push(
        '',
        '### statistics',
        '',
        statistics.msg.join('\n'),
        '',
    );

    for (const [k_hash_val, path_list] of Object.entries(statistics.report)) {
        arr.push(
            '',
            `- ${k_hash_val}`,
        );
        for (const path of path_list) {
            arr.push(
                `  - ${path}`,
            );
        }
    }

    arr.push(
        '',
        '## footer ',
        '',
        '```json',
        JSON.stringify(json.footer, null, '\t'),
        '```',
    );

    return arr.join('\n');
}
