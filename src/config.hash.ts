export type TBlock = {
    name: string,
    /**  exp `"\\/node_modules(?:\\/|$)"` */
    reg: string,
    /** exp v-flag https://v8.dev/features/regexp-v-flag / https://github.com/whatwg/html/pull/7908 */
    flag: string,
};

export type THashConfig = {
    name: string,
    fn: 'sha1' | 'sha256' | 'md5',
    report: 'json' | 'md' | 'both',

    /**
     * 1. The number of files opened and parsed simultaneously.',
     * 2. The larger the value, the faster the speed, but avoid exhausting the file handle of the OS.
     * 3. It is recommended to be much smaller than 10240, to avoid [EMFILE, too many open files](https://stackoverflow.com/questions/8965606/node-and-error-emfile-too-many-open-files) and [out of memory / OOM](https://stackoverflow.com/questions/38558989/node-js-heap-out-of-memory).
     * 4. The smaller the value, the higher the progress bar report frequency.
     * 5. Lots of small file suggestions , suggest `512 <=number <= 5120`
     * 6. There are a lot of files larger than 1 MiB , suggest `10 <=number <= 1280`.
     */
    maxOpenFiles: number,
    minCollisionValueToShow: number,
    blockList: string[],
};

export type THashConfigList = THashConfig[];
