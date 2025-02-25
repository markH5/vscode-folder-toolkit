import type { THashConfig } from './config.hash';

export type THash = THashConfig['fn'];

export type TBlockRuler = {
    readonly name: string,
    readonly reg: RegExp,
};
