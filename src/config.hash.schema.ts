import { array, literal, number, object, pipe, safeParser, string, toMinValue, union } from 'valibot';

const schema = object({
    name: string(),
    fn: union([literal('sha1'), literal('sha256'), literal('md5')]),
    report: union([literal('json'), literal('md'), literal('both')]),
    maxOpenFiles: pipe(number(), toMinValue(1)),
    blockList: array(string()),
});

export type TSchema = typeof schema;

export function safeParserConfig0(data: unknown) {
    return safeParser(schema)(data);
}
