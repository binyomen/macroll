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
