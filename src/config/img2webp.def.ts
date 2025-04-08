export type TImg2webp_config = {
    name: string,
    opt: string,
    allowList: string[], // ,[".jpg", ".webp", ".png"],
    max_cover_files: number,
    repors: ('json' | 'md')[],
    blockList: string[],
};
