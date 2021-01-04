const enum TokenKind {
    OpenBracket = '[',
    CloseBracket = ']',
    OpenParen = '(',
    CloseParen = ')',
    Plus = '+',
    Minus = '-',
    Mult = '*',
    Div = '/',
    Num = 'num',
    Roll = 'roll',
}

interface OpenBracketToken {
    kind: TokenKind.OpenBracket;
}

interface CloseBracketToken {
    kind: TokenKind.CloseBracket;
}

interface OpenParenToken {
    kind: TokenKind.OpenParen;
}

interface CloseParenToken {
    kind: TokenKind.CloseParen;
}

interface PlusToken {
    kind: TokenKind.Plus;
}

interface MinusToken {
    kind: TokenKind.Minus;
}

interface MultToken {
    kind: TokenKind.Mult;
}

interface DivToken {
    kind: TokenKind.Div;
}

interface NumToken {
    kind: TokenKind.Num;
    value: number;
}

interface RollToken {
    kind: TokenKind.Roll;
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

type BasicTokenKind =
    | TokenKind.OpenBracket
    | TokenKind.CloseBracket
    | TokenKind.OpenParen
    | TokenKind.CloseParen
    | TokenKind.Plus
    | TokenKind.Minus
    | TokenKind.Mult
    | TokenKind.Div;

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
                return this.basicToken(TokenKind.OpenBracket);
            case ']':
                return this.basicToken(TokenKind.CloseBracket);
            case '(':
                return this.basicToken(TokenKind.OpenParen);
            case ')':
                return this.basicToken(TokenKind.CloseParen);
            case '+':
                return this.basicToken(TokenKind.Plus);
            case '-':
                return this.basicToken(TokenKind.Minus);
            case '*':
                return this.basicToken(TokenKind.Mult);
            case '/':
                return this.basicToken(TokenKind.Div);
            case 'd':
                this.innerNext();
                return {kind: TokenKind.Roll, numDice: 1, dieValue: this.lexNumber()};
            default:
                if (this.innerPeek() !== null && /\d/u.test(this.innerPeek()!)) {
                    const num = this.lexNumber();
                    if (this.innerPeek() !== null && this.innerPeek() === 'd') {
                        this.innerNext();
                        return {kind: TokenKind.Roll, numDice: num, dieValue: this.lexNumber()};
                    } else {
                        return {kind: TokenKind.Num, value: num};
                    }
                } else {
                    throw new Error(`Invalid character: ${this.innerPeek()}`);
                }
        }
    }

    private basicToken<T extends BasicTokenKind>(token: T): {kind: T} {
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

export const enum ExprKind {
    Operator = 'op',
    Num = 'num',
    Roll = 'roll',
}

export interface OperatorExpr {
    kind: ExprKind.Operator;
    op: TokenKind.Plus | TokenKind.Minus | TokenKind.Mult | TokenKind.Div;
    lhs: RollExpr;
    rhs: RollExpr;
}

export interface NumTerm {
    kind: ExprKind.Num;
    value: number;
}

export interface RollTerm {
    kind: ExprKind.Roll;
    numDice: number;
    dieValue: number;
}

export type RollExpr = OperatorExpr | NumTerm | RollTerm;

export class RollParser {
    private readonly lexer: Peeker<Token>;

    public constructor(str: string) {
        this.lexer = new Peeker(new RollLexer(str));
    }

    public parse(): RollExpr {
        this.consume(TokenKind.OpenBracket);

        const expr = this.parseExpression();

        this.consume(TokenKind.CloseBracket);
        return expr;
    }

    private next(): Token | null {
        return this.lexer.next();
    }

    private peek(): Token | null {
        return this.lexer.peek();
    }

    private consume(kind: BasicTokenKind): void {
        if (this.peek() === null) {
            throw new Error('Unexpected end of syntax.');
        }

        if (this.peek()!.kind === kind) {
            this.next();
        } else {
            const tokenType = this.peek()!.kind;
            throw new Error(`Unexpected token type '${tokenType}'. Expected '${kind}'.`);
        }
    }

    private parseExpression(): RollExpr {
        const lhs = this.parseAddend();
        if (this.peek() !== null && [TokenKind.Plus, TokenKind.Minus].includes(this.peek()!.kind)) {
            const op = this.next()!.kind as TokenKind.Plus | TokenKind.Minus;
            const rhs = this.parseExpression();
            return {kind: ExprKind.Operator, op, lhs, rhs};
        } else {
            return lhs;
        }
    }

    private parseAddend(): RollExpr {
        const lhs = this.parseFactor();
        if (this.peek() !== null && [TokenKind.Mult, TokenKind.Div].includes(this.peek()!.kind)) {
            const op = this.next()!.kind as TokenKind.Mult | TokenKind.Div;
            const rhs = this.parseAddend();
            return {kind: ExprKind.Operator, op, lhs, rhs};
        } else {
            return lhs;
        }
    }

    private parseFactor(): RollExpr {
        const next = this.next();
        if (next === null) {
            throw new Error('Unexpected end of syntax.');
        }

        switch (next.kind) {
            case TokenKind.OpenParen: {
                const expr = this.parseExpression();
                this.consume(TokenKind.CloseParen);
                return expr;
            }
            case TokenKind.Num:
                return {kind: ExprKind.Num, value: next.value};
            case TokenKind.Roll:
                return {kind: ExprKind.Roll, numDice: next.numDice, dieValue: next.dieValue};
            default:
                throw new Error(`Unexpected token: ${next.kind}`);
        }
    }
}
