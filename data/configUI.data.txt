export type THashConfig = {
    name: string,
    fn: 'sha1' | 'sha256' | 'md5',
    report: 'json' | 'md' | 'both',
    blockList: {
        name: string,
        reg: string,
    }[],
};

export type THash = THashConfig['fn'];

export type TBlockRuler = {
    readonly name: string,
    readonly reg: RegExp,
};
