import type { TBlock } from '../config.hash';

export type TImg2webp_config = {
    name: string,
    opt: string,
    allowList: string[], // ,[".jpg", ".webp", ".png"],
    blockList: TBlock[],
};
