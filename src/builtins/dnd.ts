import type {IRollSet} from '../macro';

export function attack(toHit: IRollSet, dmg: IRollSet, adv: boolean = false): void {
    console.log(`Attack: ${toHit} to hit, ${dmg} damage, advantage: ${adv}`);
}
