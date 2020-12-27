import parse from 'csv-parse/lib/sync';

export enum Operator {
    Plus = 'Operator.Plus',
    Minus = 'Operator.Minus',
}

export interface IRoll {
    readonly numDice: number;
    readonly dieValue: number;
    readonly operator: Operator;

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
    public readonly operator: Operator;

    public constructor(numDice: number, dieValue: number, operator: Operator) {
        this.numDice = numDice;
        this.dieValue = dieValue;
        this.operator = operator;
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

export type MacroArg = string | number | IRollSet;

export interface IMacroCall {
    readonly name: string;
    readonly args: MacroArg[];
}

export function parseMacro(macroString: string): IMacroCall {
    const lines = parse(macroString, {delimiter: ' ', escape: '\\', trim: true}) as string[][];
    if (lines.length !== 1) {
        throw new Error(`Error parsing macro string: ${macroString}`);
    }
    const result = lines[0]!.filter(s => s.length > 0);

    const name = result[0]!;
    return {
        name,
        args: result.slice(1).map(parseArg),
    };
}

class RollSetParser {
    private readonly str: string;
    private index: number = 0;
    public constructor(str: string) {
        this.str = str;
    }

    public parse(): IRollSet {
        this.consume('[');

        let modifier = 0;
        const rolls: IRoll[] = [];
        const addRoll = (operator: Operator): void => {
            const roll = this.parseRoll(operator);
            if (typeof roll === 'number') {
                modifier += roll;
            } else {
                rolls.push(roll);
            }
        };

        addRoll(Operator.Plus);
        this.clearSpaces();
        while (this.peek() !== null && this.peek() !== ']') {
            const op = this.parseOperator();
            addRoll(op);
            this.clearSpaces();
        }
        this.consume(']');

        this.index = 0;
        return new RollSet(rolls, modifier);
    }

    private read(i: number): string | null {
        if (i >= this.str.length) {
            return null;
        } else {
            return this.str[i]!;
        }
    }

    private next(): string | null {
        this.index += 1;
        return this.read(this.index - 1);
    }

    private peek(): string | null {
        return this.read(this.index);
    }

    private consume(char: string): void {
        if (this.peek() === char) {
            this.next();
        } else {
            throw new Error(`Unexpected character '${this.peek()}'. Expected '${char}'.`);
        }
    }

    private clearSpaces(): void {
        while (this.peek() !== null && /\s/u.test(this.peek()!)) {
            this.next();
        }
    }

    private parseNumber(): number {
        if (this.peek() === null || !/\d/u.test(this.peek()!)) {
            throw new Error(`Number cannot start with '${this.peek()}'.`);
        }

        const digits = [];
        while (this.peek() !== null && /\d/u.test(this.peek()!)) {
            digits.push(Number.parseInt(this.next()!, 10));
        }

        let n = 0;
        for (let i = digits.length - 1; i >= 0; i -= 1) {
            const exponent = digits.length - 1 - i;
            n += digits[i]! * (10 ** exponent);
        }
        return n;
    }

    private parseRoll(operator: Operator): IRoll | number {
        this.clearSpaces();
        const n = ((): number => {
            if (/\d/u.test(this.peek()!)) {
                return this.parseNumber();
            } else if (this.peek() === 'd') {
                return 1;
            } else {
                throw new Error(`Unexpected character '${this.peek()}'. Expected 'd' or a digit.`);
            }
        })();

        if (this.peek() === 'd') {
            this.consume('d');
            const dieValue = this.parseNumber();
            return new Roll(n, dieValue, operator);
        } else {
            const modifier = operator === Operator.Plus ?
                1 :
                -1;
            return n * modifier;
        }
    }

    private parseOperator(): Operator {
        this.clearSpaces();

        const op = this.next();
        if (op === '+') {
            return Operator.Plus;
        } else if (op === '-') {
            return Operator.Minus;
        } else {
            throw new Error(`Invalid operator '${op}'.`);
        }
    }
}

const NUM_PATTERN = /^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$/u;
export function parseArg(arg: string): MacroArg {
    if (NUM_PATTERN.test(arg)) {
        return Number.parseFloat(arg);
    } else if (arg.startsWith('[')) {
        return new RollSetParser(arg).parse();
    } else {
        return arg;
    }
}
