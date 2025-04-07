import { array, object, safeParser, string } from 'valibot';

export const schema = object({
    name: string(),
    opt: string(),
    allowList: array(string()),
    blockList: array(object({
        name: string(),
        reg: string(),
        flag: string(),
    })),
});

export type TSchema = typeof schema;

export function safeParserConfig_1(data: unknown) {
    return safeParser(schema)(data);
}
