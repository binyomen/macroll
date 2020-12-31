import {suite, test} from '@testdeck/mocha';
import * as chai from 'chai';
import * as history from '../src/history.ts';

const should = chai.should();

@suite class HistoryTests {
    @test async 'should start empty'() {
        const historyArray = [];
        await history.initialize(historyArray);

        history.updateCurrent('current');

        historyArray.length.should.equal(0);
        should.equal(await history.previous(0), null);
        should.equal(await history.next(0), null);
        (await history.get(0)).should.equal('current');
    }

    @test async 'should handle a single item'() {
        const historyArray = [];
        await history.initialize(historyArray);

        await history.add('line1');
        history.updateCurrent('current');

        historyArray.length.should.equal(1);
        should.equal(await history.previous(0), 1);
        should.equal(await history.next(0), null);
        should.equal(await history.previous(1), null);
        should.equal(await history.next(1), 0);
        (await history.get(0)).should.equal('current');
        (await history.get(1)).should.equal('line1');
    }

    @test async 'should handle many items'() {
        const historyArray = [];
        await history.initialize(historyArray);

        await history.add('line1');
        await history.add('line2');
        await history.add('line3');
        await history.add('line4');
        await history.add('line5');
        history.updateCurrent('current');

        historyArray.length.should.equal(5);

        // on 'current'
        should.equal(await history.previous(0), 1);
        should.equal(await history.next(0), null);

        // on 'line5'
        should.equal(await history.previous(1), 2);
        should.equal(await history.next(1), 0);

        // on 'line4'
        should.equal(await history.previous(2), 3);
        should.equal(await history.next(2), 1);

        // on 'line3'
        should.equal(await history.previous(3), 4);
        should.equal(await history.next(3), 2);

        // on 'line2'
        should.equal(await history.previous(4), 5);
        should.equal(await history.next(4), 3);

        // on 'line1'
        should.equal(await history.previous(5), null);
        should.equal(await history.next(5), 4);

        (await history.get(0)).should.equal('current');
        (await history.get(1)).should.equal('line5');
        (await history.get(2)).should.equal('line4');
        (await history.get(3)).should.equal('line3');
        (await history.get(4)).should.equal('line2');
        (await history.get(5)).should.equal('line1');
    }

    @test async 'should not add repeat items'() {
        const historyArray = [];
        await history.initialize(historyArray);

        await history.add('line1');
        historyArray.length.should.equal(1);
        historyArray[0].should.equal('line1');
        (await history.get(0)).should.equal('');
        (await history.get(1)).should.equal('line1');

        await history.add('line1');
        historyArray.length.should.equal(1);
        historyArray[0].should.equal('line1');
        (await history.get(0)).should.equal('');
        (await history.get(1)).should.equal('line1');
    }

    @test async 'should not add repeat items after adding one'() {
        const historyArray = [];
        await history.initialize(historyArray);

        await history.add('line1');
        historyArray.length.should.equal(1);
        historyArray[0].should.equal('line1');
        (await history.get(0)).should.equal('');
        (await history.get(1)).should.equal('line1');

        await history.add('line2');
        historyArray.length.should.equal(2);
        historyArray[0].should.equal('line1');
        historyArray[1].should.equal('line2');
        (await history.get(0)).should.equal('');
        (await history.get(1)).should.equal('line2');
        (await history.get(2)).should.equal('line1');

        await history.add('line2');
        historyArray.length.should.equal(2);
        historyArray[0].should.equal('line1');
        historyArray[1].should.equal('line2');
        (await history.get(0)).should.equal('');
        (await history.get(1)).should.equal('line2');
        (await history.get(2)).should.equal('line1');
    }
}
