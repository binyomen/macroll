interface OpenBracketToken {
    kind: '[';
}

interface CloseBracketToken {
    kind: ']';
}

interface OpenParenToken {
    kind: '(';
}

interface CloseParenToken {
    kind: ')';
}

interface PlusToken {
    kind: '+';
}

interface MinusToken {
    kind: '-';
}

interface MultToken {
    kind: '*';
}

interface DivToken {
    kind: '/';
}

interface NumToken {
    kind: 'num';
    value: number;
}

interface RollToken {
    kind: 'roll';
    numDice: number;
    dieValue: number;
}

type Token =
    | OpenBracketToken
    | CloseBracketToken
    | OpenParenToken
    | CloseParenToken
    | PlusToken
    | MinusToken
    | MultToken
    | DivToken
    | NumToken
    | RollToken;

type BasicTokenKind = '[' | ']' | '+' | '-' | '(' | ')' | '*' | '/';

export class Peeker<T> {
    private readonly inner: {next: () => T | null};
    private hasCache: boolean = false;
    private cache: T | null = null;

    public constructor(inner: {next: () => T | null}) {
        this.inner = inner;
    }

    public peek(): T | null {
        if (this.hasCache) {
            return this.cache;
        } else {
            this.cache = this.inner.next();
            this.hasCache = true;
            return this.cache;
        }
    }

    public next(): T | null {
        const oldHasCache = this.hasCache;
        this.hasCache = false;
        if (oldHasCache) {
            return this.cache;
        } else {
            return this.inner.next();
        }
    }
}

export class RollLexer {
    private readonly str: string;
    private index: number = 0;

    public constructor(str: string) {
        this.str = str;
    }

    public next(): Token | null {
        this.clearSpaces();

        if (this.innerPeek() === null) {
            return null;
        }

        switch (this.innerPeek()) {
            case '[':
                return this.basicToken('[');
            case ']':
                return this.basicToken(']');
            case '(':
                return this.basicToken('(');
            case ')':
                return this.basicToken(')');
            case '+':
                return this.basicToken('+');
            case '-':
                return this.basicToken('-');
            case '*':
                return this.basicToken('*');
            case '/':
                return this.basicToken('/');
            case 'd':
                this.innerNext();
                return {kind: 'roll', numDice: 1, dieValue: this.lexNumber()};
            default:
                if (this.innerPeek() !== null && /\d/u.test(this.innerPeek()!)) {
                    const num = this.lexNumber();
                    if (this.innerPeek() !== null && this.innerPeek() === 'd') {
                        this.innerNext();
                        return {kind: 'roll', numDice: num, dieValue: this.lexNumber()};
                    } else {
                        return {kind: 'num', value: num};
                    }
                } else {
                    throw new Error(`Invalid character: ${this.innerPeek()}`);
                }
        }
    }

    private basicToken<T extends BasicTokenKind>(token: T): {kind: BasicTokenKind} {
        this.innerNext();
        return {kind: token};
    }

    private read(i: number): string | null {
        if (i >= this.str.length) {
            return null;
        } else {
            return this.str[i]!;
        }
    }

    private innerNext(): string | null {
        this.index += 1;
        return this.read(this.index - 1);
    }

    private innerPeek(): string | null {
        return this.read(this.index);
    }

    private clearSpaces(): void {
        while (this.innerPeek() !== null && /\s/u.test(this.innerPeek()!)) {
            this.innerNext();
        }
    }

    private lexNumber(): number {
        if (this.innerPeek() === null || !/\d/u.test(this.innerPeek()!)) {
            throw new Error(`A number cannot start with '${this.innerPeek()}'.`);
        }

        const digits = [];
        while (this.innerPeek() !== null && /\d/u.test(this.innerPeek()!)) {
            digits.push(Number.parseInt(this.innerNext()!, 10));
        }

        let n = 0;
        for (let i = digits.length - 1; i >= 0; i -= 1) {
            const exponent = digits.length - 1 - i;
            n += digits[i]! * (10 ** exponent);
        }
        return n;
    }
}
