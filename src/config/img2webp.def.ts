import type { WebpOptions } from 'sharp';
import type { TBlock } from '../config.hash';

export type TImg2webp_config = {
    name: string,
    maxOpenFiles: number,
    sharp_options: WebpOptions,
    allowList: string[], // ,[".jpg", ".webp", ".png"],
    blockList: TBlock[],
};
