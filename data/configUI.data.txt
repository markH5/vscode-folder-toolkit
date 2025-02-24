export type TBlock = {
    name: string,
    reg: string, // exp "\\/node_modules(?:\\/|$)",
    flag: string, // exp "v" flag or "i" flag
};

export type THashConfig = {
    name: string,
    fn: 'sha1' | 'sha256' | 'md5',
    report: 'json' | 'md' | 'both',
    blockList: TBlock[],
};

export type THash = THashConfig['fn'];

export type TBlockRuler = {
    readonly name: string,
    readonly reg: RegExp,
};
