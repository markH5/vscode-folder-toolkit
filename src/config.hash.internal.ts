import type { ReadonlyDeep } from 'type-fest';
import type { THashConfig } from './config.hash';

export type THash = THashConfig['fn'];

export type TBlockRuler = {
    readonly name: string,
    readonly reg: ReadonlyDeep<RegExp>,
};
