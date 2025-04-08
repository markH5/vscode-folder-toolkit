export type TBaseData = {
    path: string,
    size: number,
    sizeS: string,
};

export type TData = {
    id: number,
    raw: TBaseData,
    out: TBaseData,
    diff: {
        diff_size: string,
        diff: `+ ${string}%` | `- ${string}%`,
    },
};

export type TStatistics = {
    raw_size: string,
    out_size: string,
    diff: `+ ${string}%` | `- ${string}%`,
};
