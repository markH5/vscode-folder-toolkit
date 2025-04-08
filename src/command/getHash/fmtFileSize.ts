// const sizesMap = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB'] as const;

// export function fmtFileSize(bytes: number, toFixed: number): string {
//     if (bytes === 0) return '0 Bytes';
//     if (bytes <= 1024) return `${bytes} Bytes`;

//     const i: number = Math.floor(Math.log(bytes) / Math.log(1024));
//     const fileSzie: number = bytes / (1024 ** i);
//     return `${fileSzie.toFixed(toFixed)} ${sizesMap[i]}`;
// }

export function fmtFileSize(size: number, toFixed: number): string {
    if (size < 1024) return `${size} Bytes`;
    if (size < 1024 ** 2) return `${(size / 1024).toFixed(toFixed)} KiB`;
    if (size < 1024 ** 3) return `${(size / 1024 ** 2).toFixed(toFixed)} MiB`;
    if (size < 1024 ** 4) return `${(size / 1024 ** 3).toFixed(toFixed)} GiB`;
    if (size < 1024 ** 5) return `${(size / 1024 ** 4).toFixed(toFixed)} TiB`;

    return `${(size / 1024 ** 6).toFixed(2)} PiB`;
}
