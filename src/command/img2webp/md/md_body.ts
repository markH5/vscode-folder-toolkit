import type { TData } from '../def';

export function md_body(datas: TData[]): string[] {
    const md_arr: string[] = [];

    const ln0: number = Math.max(':--'.length, (datas.at(-1)?.id.toString() ?? '').length);
    const ln1: number = 12; // '2048.00 KiB'.length === 11, safe to 12
    const ln2: number = 12; // '2048.00 KiB'.length === 11, safe to 12
    const ln3: number = 11; // Math.max('- 90.01%'.length, '+ unknown %'.length);
    const ln4: number = '[id_]'.length
        + ln0
        + '(file:/'.length
        + Math.max(...datas.map((v) => v.raw.path.length))
        + 1 // "png" |"jpg" -> "webp" length
        + ')'.length;
    const ln5: number = ln4;

    {
        const a0: string = 'id'.padStart(ln0);
        const a1: string = 'raw_size'.padStart(ln1);
        const a2: string = 'out_size'.padStart(ln2);
        const a3: string = 'diff'.padStart(ln3);
        const a4: string = 'raw_file'.padEnd(ln4);
        const a5: string = 'out_file'.padEnd(ln5);

        const b0: string = ':--'.padEnd(ln0, '-');
        const b1: string = ':--'.padEnd(ln1, '-');
        const b2: string = ':--'.padEnd(ln2, '-');
        const b3: string = ':--'.padEnd(ln3, '-');
        const b4: string = '--:'.padStart(ln4, '-');
        const b5: string = b4; // ln4 === ln5

        md_arr.push(
            '',
            `| ${a0} | ${a1} | ${a2} | ${a3} | ${a4} | ${a5} |`,
            `| ${b0} | ${b1} | ${b2} | ${b3} | ${b4} | ${b5} |`,
        );
    }

    for (const data of datas) {
        const a0: string = data.id.toString().padStart(ln0);
        const a1: string = data.raw.sizeS.padStart(ln1);
        const a2: string = data.out.sizeS.padStart(ln2);
        const a3: string = data.diff.diff.padStart(ln3);

        const id_str: string = `id_${data.id.toString().padStart(ln0, '0')}`;
        const a4: string = `[${id_str}](file:/${data.raw.path})`.padEnd(ln4);
        const a5: string = `[${id_str}](file:/${data.out.path})`.padEnd(ln5);

        md_arr.push(
            `| ${a0} | ${a1} | ${a2} | ${a3} | ${a4} | ${a5} |`,
        );
    }

    return md_arr;
}
