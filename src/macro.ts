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

export function parseMacro(macroString: string): string[] {
    return [macroString];
}
