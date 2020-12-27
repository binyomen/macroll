import type {IRollSet} from '../macro';

export default {
    attack: (toHit: IRollSet, dmg: IRollSet, adv: boolean = false): void => {
        console.log(`Attack: ${toHit} to hit, ${dmg} damage, advantage: ${adv}`);
    },
};
