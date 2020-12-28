import {suite, test} from '@testdeck/mocha';
import * as chai from 'chai';
import * as history from '../src/history.ts';

const should = chai.should();

@suite class HistoryTests {
    @test 'should start empty'() {
        const historyArray = [];
        history.initialize(historyArray);

        history.updateCurrent('current');

        historyArray.length.should.equal(0);
        should.equal(history.previous(0), null);
        should.equal(history.next(0), null);
        history.get(0).should.equal('current');
    }

    @test 'should handle a single item'() {
        const historyArray = [];
        history.initialize(historyArray);

        history.add('line1');
        history.updateCurrent('current');

        historyArray.length.should.equal(1);
        should.equal(history.previous(0), 1);
        should.equal(history.next(0), null);
        should.equal(history.previous(1), null);
        should.equal(history.next(1), 0);
        history.get(0).should.equal('current');
        history.get(1).should.equal('line1');
    }

    @test 'should handle many items'() {
        const historyArray = [];
        history.initialize(historyArray);

        history.add('line1');
        history.add('line2');
        history.add('line3');
        history.add('line4');
        history.add('line5');
        history.updateCurrent('current');

        historyArray.length.should.equal(5);

        // on 'current'
        should.equal(history.previous(0), 1);
        should.equal(history.next(0), null);

        // on 'line5'
        should.equal(history.previous(1), 2);
        should.equal(history.next(1), 0);

        // on 'line4'
        should.equal(history.previous(2), 3);
        should.equal(history.next(2), 1);

        // on 'line3'
        should.equal(history.previous(3), 4);
        should.equal(history.next(3), 2);

        // on 'line2'
        should.equal(history.previous(4), 5);
        should.equal(history.next(4), 3);

        // on 'line1'
        should.equal(history.previous(5), null);
        should.equal(history.next(5), 4);

        history.get(0).should.equal('current');
        history.get(1).should.equal('line5');
        history.get(2).should.equal('line4');
        history.get(3).should.equal('line3');
        history.get(4).should.equal('line2');
        history.get(5).should.equal('line1');
    }

    @test 'should not add repeat items'() {
        const historyArray = [];
        history.initialize(historyArray);

        history.add('line1');
        historyArray.length.should.equal(1);
        historyArray[0].should.equal('line1');
        history.get(0).should.equal('');
        history.get(1).should.equal('line1');

        history.add('line1');
        historyArray.length.should.equal(1);
        historyArray[0].should.equal('line1');
        history.get(0).should.equal('');
        history.get(1).should.equal('line1');
    }

    @test 'should not add repeat items after adding one'() {
        const historyArray = [];
        history.initialize(historyArray);

        history.add('line1');
        historyArray.length.should.equal(1);
        historyArray[0].should.equal('line1');
        history.get(0).should.equal('');
        history.get(1).should.equal('line1');

        history.add('line2');
        historyArray.length.should.equal(2);
        historyArray[0].should.equal('line1');
        historyArray[1].should.equal('line2');
        history.get(0).should.equal('');
        history.get(1).should.equal('line2');
        history.get(2).should.equal('line1');

        history.add('line2');
        historyArray.length.should.equal(2);
        historyArray[0].should.equal('line1');
        historyArray[1].should.equal('line2');
        history.get(0).should.equal('');
        history.get(1).should.equal('line2');
        history.get(2).should.equal('line1');
    }
}
