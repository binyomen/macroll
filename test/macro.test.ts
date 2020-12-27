import {suite, test} from '@testdeck/mocha';
import * as chai from 'chai';
import {parseMacro, parseArg, Operator, IRoll, Roll, IRollSet, RollSet} from '../src/macro.ts';

chai.should();

function r(numDice: number, dieValue: number, operator: Operator): IRoll {
    return new Roll(numDice, dieValue, operator);
}
function rs(rolls: IRoll[], modifier: number) {
    return new RollSet(rolls, modifier);
}
const PLUS = Operator.Plus;
const MINUS = Operator.Minus;

@suite class RollSetTests {
    @test 'should have proper string form'() {
        r(1, 6, PLUS).toString().should.equal('1d6');
        r(1, 6, MINUS).toString().should.equal('1d6');
        r(3, 6, PLUS).toString().should.equal('3d6');
        r(3, 6, MINUS).toString().should.equal('3d6');

        rs([], 0).toString().should.equal('[[0]]');
        rs([], 5).toString().should.equal('[[5]]');
        rs([], -5).toString().should.equal('[[-5]]');

        rs([r(3, 20, PLUS)], 0).toString().should.equal('[[ + 3d20 + 0]]');
        rs([r(3, 20, MINUS), r(1, 6, MINUS)], -8).toString().should.equal('[[ - 3d20 - 1d6 - 8]]');
    }
}

@suite class ParseMacroTests {
    @test 'should parse argumentless macro'() {
        parseMacro('name').should.deep.equal({name: 'name', args: []});
        parseMacro('split-name').should.deep.equal({name: 'split-name', args: []});
        parseMacro('"quoted name"').should.deep.equal({name: 'quoted name', args: []});
        parseMacro('5').should.deep.equal({name: '5', args: []});
    }

    @test 'should parse macro with number arguments'() {
        parseMacro('mac 1').should.deep.equal({name: 'mac', args: [1]});
        parseMacro('mac 1 2 3 "5.829" -5').should.deep.equal({name: 'mac', args: [1, 2, 3, 5.829, -5]});
    }

    @test 'should parse macro with boolean arguments'() {
        parseMacro('mac true').should.deep.equal({name: 'mac', args: [true]});
        parseMacro('mac true false true true').should.deep.equal({name: 'mac', args: [true, false, true, true]});
    }

    @test 'should parse macro with roll set arguments'() {
        parseMacro('mac [d20]').should.deep.equal({name: 'mac', args: [rs([r(1, 20, PLUS)], 0)]});
        parseMacro('mac [d20] "[4d20 + 7 - d6]"').should.deep.equal({name: 'mac', args: [
            rs([r(1, 20, PLUS)], 0),
            rs([r(4, 20, PLUS), r(1, 6, MINUS)], 7)]});
    }

    @test 'should parse macro with string arguments'() {
        parseMacro('mac hello').should.deep.equal({name: 'mac', args: ['hello']});
        parseMacro('mac hello there it\'s "a me," Mario!').should.deep.equal({name: 'mac', args: ['hello', 'there', 'it\'s', 'a me,', 'Mario!']});
    }

    @test 'should parse macro with mixed type arguments'() {
        parseMacro('mac hello false 5 0 [d20] -4.8 there 5.')
            .should.deep.equal({name: 'mac', args: ['hello', false, 5, 0, rs([r(1, 20, PLUS)], 0), -4.8, 'there', 5]});
    }

    @test 'should remove extra spaces'() {
        parseMacro('  mac 1  2 3 ').should.deep.equal({name: 'mac', args: [1, 2, 3]});
    }

    @test 'should handle escapes properly'() {
        parseMacro('mac arg1 "longer arg" "arg with \\"stuff in quotes\\"" "arg with \\\\ random backslashes"')
            .should.deep.equal({name: 'mac', args: ['arg1', 'longer arg', 'arg with "stuff in quotes"', 'arg with \\\\ random backslashes']});
    }

    @test 'should fail to parse multi-line strings'() {
        (() => parseMacro('line1 and\nline 2')).should.throw("Error parsing macro string: line1 and\nline 2");
    }
}

@suite class ParseArgTests {
    @test 'should parse zero'() {
        parseArg('0').should.equal(0);
        parseArg('+0').should.equal(0);
        parseArg('-0').should.equal(0);
        parseArg('00').should.equal(0);
        parseArg('+00').should.equal(0);
        parseArg('-00').should.equal(0);
        parseArg('0.').should.equal(0);
        parseArg('.0').should.equal(0);
        parseArg('0.0').should.equal(0);
        parseArg('000.00').should.equal(0);
        parseArg('+000.00').should.equal(0);
        parseArg('-000.00').should.equal(0);
    }

    @test 'should parse integers'() {
        parseArg('1').should.equal(1);
        parseArg('01').should.equal(1);
        parseArg('5012').should.equal(5012);
        parseArg('-5012').should.equal(-5012);
        parseArg('-05012').should.equal(-5012);
    }

    @test 'should parse floats'() {
        parseArg('.1').should.equal(0.1);
        parseArg('1.').should.equal(1);
        parseArg('+.1').should.equal(0.1);
        parseArg('+1.').should.equal(1);
        parseArg('-.1').should.equal(-0.1);
        parseArg('-1.').should.equal(-1);
        parseArg('-0001.00').should.equal(-1);

        parseArg('.506').should.equal(0.506);
        parseArg('506.').should.equal(506);
        parseArg('+.506').should.equal(0.506);
        parseArg('+506.').should.equal(506);
        parseArg('-.506').should.equal(-0.506);
        parseArg('-506.').should.equal(-506);
        parseArg('-000506.00').should.equal(-506);

        parseArg('-00573.294820300').should.equal(-573.2948203);
    }

    @test 'should parse booleans'() {
        parseArg('true').should.deep.equal(true);
        parseArg('false').should.deep.equal(false);
        parseArg(' true').should.deep.equal(' true');
        parseArg(' false').should.deep.equal(' false');
        parseArg('true ').should.deep.equal('true ');
        parseArg('false ').should.deep.equal('false ');
    }

    @test 'should parse single rolls'() {
        parseArg('[d20]').should.deep.equal(rs([r(1, 20, PLUS)], 0));
        parseArg('[1d20]').should.deep.equal(rs([r(1, 20, PLUS)], 0));
        parseArg('[6d3]').should.deep.equal(rs([r(6, 3, PLUS)], 0));
        parseArg('[ 6d3    ] ').should.deep.equal(rs([r(6, 3, PLUS)], 0));

        parseArg('[5] ').should.deep.equal(rs([], 5));
        parseArg('[ 5    ] ').should.deep.equal(rs([], 5));

        parseArg(' [d20]').should.equal(' [d20]');
    }

    @test 'should parse multiple rolls'() {
        parseArg('[d20+4+3d10]').should.deep.equal(rs([r(1, 20, PLUS), r(3, 10, PLUS)], 4));
        parseArg('[d20-4-3d10]').should.deep.equal(rs([r(1, 20, PLUS), r(3, 10, MINUS)], -4));
        parseArg('[   d20 +  4+   3d10 ]  ').should.deep.equal(rs([r(1, 20, PLUS), r(3, 10, PLUS)], 4));
        parseArg('[   d20 -  4-   3d10 ]  ').should.deep.equal(rs([r(1, 20, PLUS), r(3, 10, MINUS)], -4));
    }

    @test 'should fail on invalid roll syntax'() {
        (() => parseArg('[d20')).should.throw("Unexpected character 'null'. Expected ']'.");
        (() => parseArg('[+d20]')).should.throw("Unexpected character '+'. Expected 'd' or a digit.");
        (() => parseArg('[-d20]')).should.throw("Unexpected character '-'. Expected 'd' or a digit.");
        (() => parseArg('[d20 d10]')).should.throw("Invalid operator 'd'.");
        (() => parseArg('[4d30d6]')).should.throw("Invalid operator 'd'.");
        (() => parseArg('[d20 3d10]')).should.throw("Invalid operator '3'.");
        (() => parseArg('[4d+5]')).should.throw("Number cannot start with '+'.");
        (() => parseArg('[4d + 5]')).should.throw("Number cannot start with ' '.");
    }

    @test 'should parse strings'() {
        parseArg('hello').should.equal('hello');
        parseArg('hello\\').should.equal('hello\\');
        parseArg('hello with spaces whoo').should.equal('hello with spaces whoo');
        parseArg('hello with \\spaces whoo').should.equal('hello with \\spaces whoo');
    }
}
