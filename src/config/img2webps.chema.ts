import { array, literal, number, object, safeParser, string, union } from 'valibot';

export const schema = object({
    name: string(),
    opt: string(),
    allowList: array(string()),
    max_cover_files: number(),
    repors: array(union([literal('json'), literal('md')])),
    blockList: array(string()),
});

export type TSchema = typeof schema;

export function safeParserConfig_1(data: unknown) {
    return safeParser(schema)(data);
}
