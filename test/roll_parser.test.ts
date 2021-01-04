import {suite, test} from '@testdeck/mocha';
import * as chai from 'chai';
import {Peeker, RollLexer, RollParser, ExprKind, RollExpr, OperatorExpr, NumTerm, RollTerm} from '../src/roll_parser';

const should = chai.should();

function makeListIter(l: number[] | null[]): {next: () => number[] | null[]} {
    let i = 0;
    return {
        next: () => {
            if (i >= l.length) {
                return null;
            } else {
                const r = l[i];
                i += 1;
                return r;
            }
        }
    };
}

@suite class PeekerTests {
    @test 'should return null on empty'() {
        const p = new Peeker(makeListIter([]));
        should.equal(p.peek(), null);
        should.equal(p.next(), null);
        should.equal(p.peek(), null);
        should.equal(p.next(), null);
    }

    @test 'should return null on empty with multiple peeks'() {
        const p = new Peeker(makeListIter([]));
        should.equal(p.peek(), null);
        should.equal(p.peek(), null);
    }

    @test 'should return null on empty with no initial peek'() {
        const p = new Peeker(makeListIter([]));
        should.equal(p.next(), null);
        should.equal(p.next(), null);
    }

    @test 'should work for one number'() {
        const p = new Peeker(makeListIter([58]));
        should.equal(p.peek(), 58);
        should.equal(p.next(), 58);
        should.equal(p.peek(), null);
        should.equal(p.next(), null);
    }

    @test 'should work for one number with multiple peeks'() {
        const p = new Peeker(makeListIter([58]));
        should.equal(p.peek(), 58);
        should.equal(p.peek(), 58);
        should.equal(p.next(), 58);
        should.equal(p.peek(), null);
        should.equal(p.peek(), null);
        should.equal(p.next(), null);
    }

    @test 'should work for one number with no initial peek'() {
        const p = new Peeker(makeListIter([58]));
        should.equal(p.next(), 58);
        should.equal(p.next(), null);
    }

    @test 'should work for multiple numbers'() {
        const p = new Peeker(makeListIter([58, 69, 12]));
        should.equal(p.peek(), 58);
        should.equal(p.next(), 58);
        should.equal(p.peek(), 69);
        should.equal(p.next(), 69);
        should.equal(p.peek(), 12);
        should.equal(p.next(), 12);
        should.equal(p.peek(), null);
        should.equal(p.next(), null);
    }

    @test 'should work for multiple numbers with multiple peeks'() {
        const p = new Peeker(makeListIter([58, 69, 12]));
        should.equal(p.peek(), 58);
        should.equal(p.peek(), 58);
        should.equal(p.next(), 58);
        should.equal(p.peek(), 69);
        should.equal(p.peek(), 69);
        should.equal(p.next(), 69);
        should.equal(p.peek(), 12);
        should.equal(p.peek(), 12);
        should.equal(p.next(), 12);
        should.equal(p.peek(), null);
        should.equal(p.peek(), null);
        should.equal(p.next(), null);
    }

    @test 'should work for multiple numbers with no initial peek'() {
        const p = new Peeker(makeListIter([58, 69, 12]));
        should.equal(p.next(), 58);
        should.equal(p.next(), 69);
        should.equal(p.next(), 12);
        should.equal(p.next(), null);
    }

    @test 'should work for multiple numbers and nulls'() {
        const p = new Peeker(makeListIter([58, null, 12]));
        should.equal(p.peek(), 58);
        should.equal(p.next(), 58);
        should.equal(p.peek(), null);
        should.equal(p.next(), null);
        should.equal(p.peek(), 12);
        should.equal(p.next(), 12);
        should.equal(p.peek(), null);
        should.equal(p.next(), null);
    }

    @test 'should work for multiple numbers and nulls with multiple peeks'() {
        const p = new Peeker(makeListIter([58, null, 12]));
        should.equal(p.peek(), 58);
        should.equal(p.peek(), 58);
        should.equal(p.next(), 58);
        should.equal(p.peek(), null);
        should.equal(p.peek(), null);
        should.equal(p.next(), null);
        should.equal(p.peek(), 12);
        should.equal(p.peek(), 12);
        should.equal(p.next(), 12);
        should.equal(p.peek(), null);
        should.equal(p.peek(), null);
        should.equal(p.next(), null);
    }

    @test 'should work for multiple numbers and nulls with no initial peek'() {
        const p = new Peeker(makeListIter([58, null, 12]));
        should.equal(p.next(), 58);
        should.equal(p.next(), null);
        should.equal(p.next(), 12);
        should.equal(p.next(), null);
    }
}

function collect<T>(iter: {next: () => T | null}): T[] {
    const l = [];
    while (true) {
        const result = iter.next();
        if (result === null) {
            return l;
        } else {
            l.push(result);
        }
    }
}

function tl(kind: string): {kind: string} {
    return {kind};
}

function nl(num: number): {kind: string, value: number} {
    return {kind: 'num', value: num};
}

function rl(numDice: number, dieValue: number): {kind: string, numDice: number, dieValue: number} {
    return {kind: 'roll', numDice, dieValue};
}

function validateLexer(input: string, expected: Object[]) {
    collect(new RollLexer(input)).should.deep.equal(expected);
}

@suite class RollLexerTests {
    @test 'should lex an empty string'() {
        validateLexer('', []);
        validateLexer('       ', []);
    }

    @test 'should lex brackets'() {
        validateLexer('[]][', [tl('['), tl(']'), tl(']'), tl('[')]);
        validateLexer('  [ ]   ]  [ ', [tl('['), tl(']'), tl(']'), tl('[')]);
    }

    @test 'should lex parens'() {
        validateLexer('())(', [tl('('), tl(')'), tl(')'), tl('(')]);
        validateLexer('  ( )   )  ( ', [tl('('), tl(')'), tl(')'), tl('(')]);
    }

    @test 'should lex operators'() {
        validateLexer('+-*/', [tl('+'), tl('-'), tl('*'), tl('/')]);
        validateLexer('  + - *    / ', [tl('+'), tl('-'), tl('*'), tl('/')]);
    }

    @test 'should lex numbers'() {
        validateLexer('5 8 3748 23 0', [nl(5), nl(8), nl(3748), nl(23), nl(0)]);
        validateLexer('   5   8  3748   23     0       ', [nl(5), nl(8), nl(3748), nl(23), nl(0)]);
    }

    @test 'should lex rolls'() {
        validateLexer('d3 40d1 d100 7d7', [rl(1, 3), rl(40, 1), rl(1, 100), rl(7, 7)]);
        validateLexer('  d3  40d1     d100  7d7    ', [rl(1, 3), rl(40, 1), rl(1, 100), rl(7, 7)]);

        validateLexer('2 d5', [nl(2), rl(1, 5)]);
        validateLexer('  2  d5      ', [nl(2), rl(1, 5)]);
    }

    @test 'should lex roll expressions'() {
        validateLexer('[ (2d4 - 6) * d8 ]', [tl('['), tl('('), rl(2, 4), tl('-'), nl(6), tl(')'), tl('*'), rl(1, 8), tl(']')]);
        validateLexer('  [ (  2d4   -     6 ) * d8  ] ', [tl('['), tl('('), rl(2, 4), tl('-'), nl(6), tl(')'), tl('*'), rl(1, 8), tl(']')]);
        validateLexer('[(2d4-6)*d8]', [tl('['), tl('('), rl(2, 4), tl('-'), nl(6), tl(')'), tl('*'), rl(1, 8), tl(']')]);
        validateLexer(' [ (2d4  -6)* d8 ] ', [tl('['), tl('('), rl(2, 4), tl('-'), nl(6), tl(')'), tl('*'), rl(1, 8), tl(']')]);
        validateLexer(' [ (2d4- 6) *d8 ] ', [tl('['), tl('('), rl(2, 4), tl('-'), nl(6), tl(')'), tl('*'), rl(1, 8), tl(']')]);
    }

    @test 'should throw on invalid syntax'() {
        (() => collect(new RollLexer('r'))).should.throw('Invalid character: r');
        (() => collect(new RollLexer('a'))).should.throw('Invalid character: a');
        (() => collect(new RollLexer('d'))).should.throw("A number cannot start with 'null'.");

        (() => collect(new RollLexer('2d'))).should.throw("A number cannot start with 'null'.");
        (() => collect(new RollLexer('2dm'))).should.throw("A number cannot start with 'm'.");
        (() => collect(new RollLexer('2d + 2'))).should.throw("A number cannot start with ' '.");
        (() => collect(new RollLexer('2d+2'))).should.throw("A number cannot start with '+'.");
    }
}

function op(operator: '+' | '-' | '*' | '/', lhs: RollExpr, rhs: RollExpr): OperatorExpr {
    return {kind: ExprKind.Operator, op: {kind: operator}, lhs, rhs,};
}

function np(value: number): NumTerm {
    return {kind: ExprKind.Num, value};
}

function rp(numDice: number, dieValue: number): RollTerm {
    return {kind: ExprKind.Roll, numDice, dieValue};
}

function validateParser(input: string, expected: RollExpr) {
    (new RollParser(input)).parse().should.deep.equal(expected);
}

@suite class RollParserTests {
    @test 'should parse numbers'() {
        validateParser('[0]', np(0));
        validateParser('[5]', np(5));
        validateParser('[483]', np(483));
    }

    @test 'should parse rolls'() {
        validateParser('[d5]', rp(1, 5));
        validateParser('[4d20]', rp(4, 20));
    }

    @test 'should parse parentheses'() {
        validateParser('[(0)]', np(0));
        validateParser('[(4)]', np(4));
        validateParser('[(28492)]', np(28492));
        validateParser('[(d7)]', rp(1, 7));
        validateParser('[(5d4)]', rp(5, 4));
    }

    @test 'should parse simple expressions'() {
        validateParser('[3 + 9]', op('+', np(3), np(9)));
        validateParser('[3 - 9]', op('-', np(3), np(9)));
        validateParser('[3 * 9]', op('*', np(3), np(9)));
        validateParser('[3 / 9]', op('/', np(3), np(9)));

        validateParser('[d10 + 2d4]', op('+', rp(1, 10), rp(2, 4)));
        validateParser('[d10 - 2d4]', op('-', rp(1, 10), rp(2, 4)));
        validateParser('[d10 * 2d4]', op('*', rp(1, 10), rp(2, 4)));
        validateParser('[d10 / 2d4]', op('/', rp(1, 10), rp(2, 4)));

        validateParser('[d10 + 8 + 2d4]', op('+', rp(1, 10), op('+', np(8), rp(2, 4))));
        validateParser('[d10 - 8 - 2d4]', op('-', rp(1, 10), op('-', np(8), rp(2, 4))));
        validateParser('[d10 * 8 * 2d4]', op('*', rp(1, 10), op('*', np(8), rp(2, 4))));
        validateParser('[d10 / 8 / 2d4]', op('/', rp(1, 10), op('/', np(8), rp(2, 4))));

        validateParser('[d10 + 8 / 2d4]', op('+', rp(1, 10), op('/', np(8), rp(2, 4))));
        validateParser('[d10 - 8 * 2d4]', op('-', rp(1, 10), op('*', np(8), rp(2, 4))));
        validateParser('[d10 * 8 - 2d4]', op('-', op('*', rp(1, 10), np(8)), rp(2, 4)));
        validateParser('[d10 / 8 + 2d4]', op('+', op('/', rp(1, 10), np(8)), rp(2, 4)));
    }

    @test 'should parse complex expressions'() {
        validateParser('[d10 + 8 + 2d4 / 8d6 * 9 * 0 - 3d10]',
            op('+',
                rp(1, 10),
                op('+',
                    np(8),
                    op('-',
                        op('/',
                            rp(2, 4),
                            op('*',
                                rp(8, 6),
                                op('*', np(9), np(0)),
                            ),
                        ),
                        rp(3, 10),
                    ),
                ),
            ),
        );

        validateParser('[(3 + 4) * d20]', op('*', op('+', np(3), np(4)), rp(1, 20)));
        validateParser('[((3 + 4) * d20) / d8 * d6 - (12 / 2d20)]',
            op('-',
                op('/',
                    op('*',
                        op('+', np(3), np(4)),
                        rp(1, 20),
                    ),
                    op('*', rp(1, 8), rp(1, 6)),
                ),
                op('/', np(12), rp(2, 20)),
            ),
        );
    }

    @test 'should throw on invalid syntax'() {
        (() => (new RollParser('')).parse()).should.throw('Unexpected end of syntax.');
        (() => (new RollParser('1')).parse()).should.throw("Unexpected token type 'num'. Expected '['.");
        (() => (new RollParser('[1')).parse()).should.throw('Unexpected end of syntax.');
        (() => (new RollParser('[(1')).parse()).should.throw('Unexpected end of syntax.');
        (() => (new RollParser('[(1]')).parse()).should.throw("Unexpected token type ']'. Expected ')'.");

        (() => (new RollParser('[')).parse()).should.throw('Unexpected end of syntax.');
        (() => (new RollParser('[[')).parse()).should.throw('Unexpected token: [');

        (() => (new RollParser('[+4]')).parse()).should.throw('Unexpected token: +');
        (() => (new RollParser('[4 +]')).parse()).should.throw('Unexpected token: ]');
        (() => (new RollParser('[*4]')).parse()).should.throw('Unexpected token: *');
        (() => (new RollParser('[4 +]')).parse()).should.throw('Unexpected token: ]');

        (() => (new RollParser('[4 8')).parse()).should.throw("Unexpected token type 'num'. Expected ']'.");
        (() => (new RollParser('[4 8]')).parse()).should.throw("Unexpected token type 'num'. Expected ']'.");
    }
}
