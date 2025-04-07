import type { TBlock } from '../config.hash';

export type TImg2webp_config = {
    name: string,
    maxOpenFiles: number,
    sharp_options: object,
    allowList: string[], // ,[".jpg", ".webp", ".png"],
    blockList: TBlock[],
};
