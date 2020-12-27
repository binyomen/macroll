import type {IMacroResult, IRollSet, MacroArg} from '../macro';

export default {
    attack: (
        name: string,
        atk: IRollSet,
        dmg: IRollSet,
        advantage: string = 'norm',
        charname: string = '',
    ): IMacroResult => {
        const fields: Record<string, MacroArg> = {
            attack: 1,
            damage: 1,
            rname: name,
            r1: atk,
            r2: atk,
            dmg1: dmg,
            dmg1flag: 1,
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

        return {
            commands: [
                {
                    name: 'atkdmg',
                    fields,
                },
            ],
            onComplete: (elt: HTMLElement): IMacroResult | null => {
                console.log(elt);
                return {
                    commands: ['it worked!', 'Whoo!'],
                };
            },
        };
    },
};
