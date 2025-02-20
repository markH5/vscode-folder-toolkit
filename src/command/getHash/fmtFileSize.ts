const sizesMap = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB'] as const;

export function fmtFileSize(bytes: number, toFixed: number): string {
    if (bytes === 0) return '0 Bytes';
    if (bytes <= 1024) return `${bytes} Bytes`;

    const i: number = Math.floor(Math.log(bytes) / Math.log(1024));
    const fileSzie: number = bytes / (1024 ** i);
    return `${fileSzie.toFixed(toFixed)} ${sizesMap[i]}`;
}
