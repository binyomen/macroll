import type {IMacroResult, IRollSet} from '../macro';

export default {
    attack: (toHit: IRollSet, dmg: IRollSet): IMacroResult => {
        console.log(`Attack: ${toHit} to hit, ${dmg} damage`);
        return {};
    },
};
