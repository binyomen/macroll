import parse from 'csv-parse/lib/sync';

export interface IRoll {
    readonly numDice: number;
    readonly dieValue: number;

    readonly toString: () => string;
}

export interface IRollSet {
    readonly rolls: IRoll[];
    readonly modifier: number;

    readonly toString: () => string;
}

export class Roll implements IRoll {
    public readonly numDice: number;
    public readonly dieValue: number;

    public constructor(numDice: number, dieValue: number) {
        this.numDice = numDice;
        this.dieValue = dieValue;
    }

    public toString(): string {
        return `${this.numDice}d${this.dieValue}`;
    }
}

export class RollSet implements IRollSet {
    public readonly rolls: IRoll[];
    public readonly modifier: number;

    public constructor(rolls: IRoll[], modifier: number) {
        this.rolls = rolls;
        this.modifier = modifier;
    }

    public toString(): string {
        const rollString = this.rolls.map(r => r.toString()).join(' + ');
        return `${rollString} + ${this.modifier}`;
    }
}

export type MacroArg = string | number;

export interface IMacroCall {
    readonly name: string;
    readonly args: MacroArg[];
}

export function parseMacro(macroString: string): IMacroCall {
    const lines = parse(macroString, {delimiter: ' ', escape: '\\', trim: true}) as string[][];
    if (lines.length !== 1) {
        throw new Error(`Error parsing macro string: ${macroString}`);
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const result = lines[0]!;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const name = result[0]!;

    return {
        name,
        args: result.slice(1).filter(s => s.length > 0).map(parseArg),
    };
}

const NUM_PATTERN = /^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$/u;
export function parseArg(arg: string): MacroArg {
    if (NUM_PATTERN.test(arg)) {
        return Number.parseFloat(arg);
    } else {
        return arg;
    }
}
