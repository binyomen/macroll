import * as macroll from '../macroll';
import type {IRollSet, MacroArg} from '../macro';

export default {
    atk: async (
        name: string,
        atk: IRollSet,
        dmg: IRollSet,
        advantage: string = 'norm',
        charname: string = '',
    ): Promise<void> => {
        const fields: Record<string, MacroArg> = {
            attack: 1,
            damage: 1,
            rname: name,
            r1: atk,
            r2: atk,
            dmg1: dmg,
            dmg1flag: 1,
            crit: 1,
            crit1: dmg,
        };

        if (advantage === 'adv') {
            fields.advantage = 1;
        } else if (advantage === 'dadv') {
            fields.disadvantage = 1;
        } else {
            fields.normal = 1;
        }

        if (charname.length > 0) {
            fields.charname = charname;
        }

        const newMessage = await macroll.sendCommand({name: 'atkdmg', fields});

        const damageElts = newMessage.querySelectorAll('.sheet-damage .inlinerollresult');
        const damage = Array.from(damageElts)
            .map(e => (e as HTMLElement).innerText)
            .map(s => Number.parseInt(s, 10))
            .reduce((acc, v) => acc + v);
        await macroll.sendCommand(`Total damage: ${damage}`);
    },
};
