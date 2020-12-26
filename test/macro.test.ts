import { suite, test } from '@testdeck/mocha';
import * as chai from 'chai';
import { parseMacro } from '../src/macro.ts';

chai.should();

@suite class ParseMacroTests {
    @test 'should parse argumentless macro'() {
        parseMacro('name').should.deep.equal(['name']);
        parseMacro('split-name').should.deep.equal(['split-name']);
        parseMacro('\'quoted-name\'').should.deep.equal(['\'quoted-name\'']);
    }
}
