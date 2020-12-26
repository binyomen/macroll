import { suite, test } from '@testdeck/mocha';
import * as chai from 'chai';
import { parseMacro, parseArg } from '../src/macro.ts';

chai.should();

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

    @test 'should parse macro with string arguments'() {
        parseMacro('mac hello').should.deep.equal({name: 'mac', args: ['hello']});
        parseMacro('mac hello there it\'s "a me," Mario!').should.deep.equal({name: 'mac', args: ['hello', 'there', 'it\'s', 'a me,', 'Mario!']});
    }

    @test 'should parse macro with mixed type arguments'() {
        parseMacro('mac hello 5 0 -4.8 there 5.').should.deep.equal({name: 'mac', args: ['hello', 5, 0, -4.8, 'there', 5]});
    }

    @test 'should remove extra spaces'() {
        parseMacro('mac 1  2 3').should.deep.equal({name: 'mac', args: [1, 2, 3]});
    }
}

@suite class ParseArgTests {
    @test 'should parse strings'() {
        parseArg('hello').should.equal('hello');
        parseArg('hello\\').should.equal('hello\\');
        parseArg('hello with spaces whoo').should.equal('hello with spaces whoo');
        parseArg('hello with \\spaces whoo').should.equal('hello with \\spaces whoo');
    }

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
}
