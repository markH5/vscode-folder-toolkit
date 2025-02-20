import type { InferOutput } from 'valibot';
import { array, literal, object, safeParser, string, union } from 'valibot';

export const schema = object({
    name: string(),
    fn: union([literal('sha1'), literal('sha256'), literal('md5')]),
    report: union([literal('json'), literal('md'), literal('both')]),
    blockList: array(
        object({
            name: string(),
            reg: string(),
        }),
    ),
});
export type THashConfig_valibot = InferOutput<typeof schema>;

export function safeParserConfig0(data: unknown) {
    return safeParser(schema)(data);
}
