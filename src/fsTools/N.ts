import { normalize } from 'node:path';

/**
 * toNormalize
 * @param s your path
 */
export function N(s: string): string {
    return normalize(s).replaceAll('\\', '/');
}
