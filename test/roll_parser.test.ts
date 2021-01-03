import {suite, test} from '@testdeck/mocha';
import * as chai from 'chai';
import {Peeker, RollLexer} from '../src/roll_parser';

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

function t(kind: string): {kind: string} {
    return {kind};
}

function n(num: number): {kind: string, value: number} {
    return {kind: 'num', value: num};
}

function r(numDice: number, dieValue: number): {kind: string, numDice: number, dieValue: number} {
    return {kind: 'roll', numDice, dieValue};
}

@suite class RollLexerTests {
    @test 'should lex an empty string'() {
        collect(new RollLexer('')).should.deep.equal([]);
        collect(new RollLexer('       ')).should.deep.equal([]);
    }

    @test 'should lex brackets'() {
        collect(new RollLexer('[]][')).should.deep.equal([t('['), t(']'), t(']'), t('[')]);
        collect(new RollLexer('  [ ]   ]  [ ')).should.deep.equal([t('['), t(']'), t(']'), t('[')]);
    }

    @test 'should lex parens'() {
        collect(new RollLexer('())(')).should.deep.equal([t('('), t(')'), t(')'), t('(')]);
        collect(new RollLexer('  ( )   )  ( ')).should.deep.equal([t('('), t(')'), t(')'), t('(')]);
    }

    @test 'should lex operators'() {
        collect(new RollLexer('+-*/')).should.deep.equal([t('+'), t('-'), t('*'), t('/')]);
        collect(new RollLexer('  + - *    / ')).should.deep.equal([t('+'), t('-'), t('*'), t('/')]);
    }

    @test 'should lex numbers'() {
        collect(new RollLexer('5 8 3748 23 0')).should.deep.equal([n(5), n(8), n(3748), n(23), n(0)]);
        collect(new RollLexer('   5   8  3748   23     0       ')).should.deep.equal([n(5), n(8), n(3748), n(23), n(0)]);
    }

    @test 'should lex rolls'() {
        collect(new RollLexer('d3 40d1 d100 7d7')).should.deep.equal([r(1, 3), r(40, 1), r(1, 100), r(7, 7)]);
        collect(new RollLexer('  d3  40d1     d100  7d7    ')).should.deep.equal([r(1, 3), r(40, 1), r(1, 100), r(7, 7)]);

        collect(new RollLexer('2 d5')).should.deep.equal([n(2), r(1, 5)]);
        collect(new RollLexer('  2  d5      ')).should.deep.equal([n(2), r(1, 5)]);
    }

    @test 'should lex roll expressions'() {
        collect(new RollLexer('[ (2d4 - 6) * d8 ]')).should.deep.equal([t('['), t('('), r(2, 4), t('-'), n(6), t(')'), t('*'), r(1, 8), t(']')]);
        collect(new RollLexer('  [ (  2d4   -     6 ) * d8  ] ')).should.deep.equal([t('['), t('('), r(2, 4), t('-'), n(6), t(')'), t('*'), r(1, 8), t(']')]);
        collect(new RollLexer('[(2d4-6)*d8]')).should.deep.equal([t('['), t('('), r(2, 4), t('-'), n(6), t(')'), t('*'), r(1, 8), t(']')]);
        collect(new RollLexer(' [ (2d4  -6)* d8 ] ')).should.deep.equal([t('['), t('('), r(2, 4), t('-'), n(6), t(')'), t('*'), r(1, 8), t(']')]);
        collect(new RollLexer(' [ (2d4- 6) *d8 ] ')).should.deep.equal([t('['), t('('), r(2, 4), t('-'), n(6), t(')'), t('*'), r(1, 8), t(']')]);
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
