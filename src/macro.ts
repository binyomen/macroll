// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import * as papa from 'papaparse';

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
        if (this.rolls.length === 0) {
            return `[[${this.modifier}]]`;
        } else {
            let rollString = '[[';
            for (const roll of this.rolls) {
                const op = roll.operator === Operator.Plus ?
                    '+' :
                    '-';
                rollString += ` ${op} ${roll}`;
            }

            if (this.modifier < 0) {
                rollString += ` - ${Math.abs(this.modifier)}`;
            } else {
                rollString += ` + ${this.modifier}`;
            }

            rollString += ']]';
            return rollString;
        }
    }
}

export type MacroArg = number | boolean | IRollSet | string;

export interface IMacroCall {
    readonly name: string;
    readonly args: MacroArg[];
}

export interface ITemplate {
    name: string;
    fields: Record<string, MacroArg>;
}

export type MacroCommand = string | ITemplate;

export interface IMacroResult {
    commands: MacroCommand[];
}

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
    } else if (arg === 'true') {
        return true;
    } else if (arg === 'false') {
        return false;
    } else if (arg.startsWith('[')) {
        return new RollSetParser(arg).parse();
    } else {
        return arg;
    }
}
