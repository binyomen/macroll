// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import * as papa from 'papaparse';
import type {RollExpr} from './roll_parser';
import {RollParser} from './roll_parser';

export type MacroArg = number | boolean | RollExpr | string;

export interface IMacroCall {
    readonly name: string;
    readonly args: MacroArg[];
}

export interface ITemplate {
    name: string;
    fields: Record<string, MacroArg>;
}

export type MacroCommand = string | ITemplate;

export function parseMacro(macroString: string): IMacroCall {
    const parseResult =
        // eslint-disable-next-line max-len
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        papa.parse(macroString, {delimiter: ' ', escapeChar: '\\'}) as {data: string[][]};
    if (parseResult.data.length !== 1) {
        throw new Error(`Error parsing macro string: ${macroString}`);
    }
    const result = parseResult.data[0]!.filter(s => s.length > 0);

    const name = result[0]!;
    return {
        name,
        args: result.slice(1).map(parseArg),
    };
}

const NUM_PATTERN = /^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$/u;
export function parseArg(arg: string): MacroArg {
    if (NUM_PATTERN.test(arg)) {
        return Number.parseFloat(arg);
    } else if (arg === 'true') {
        return true;
    } else if (arg === 'false') {
        return false;
    } else if (arg.startsWith('[')) {
        return new RollParser(arg).parse();
    } else {
        return arg;
    }
}
