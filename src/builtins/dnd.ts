import type {IMacroResult, IRollSet, MacroArg} from '../macro';

export default {
    attack: (
        name: string,
        mod: number,
        atk: IRollSet,
        dmg: IRollSet,
        advantage: string = 'norm',
        charname: string = '',
    ): IMacroResult => {
        const fields: Record<string, MacroArg> = {
            rname: name,
            mod,
            r1: atk,
            hldmg: dmg,
        };

        if (advantage === 'norm') {
            fields.normal = 1;
        } else if (advantage === 'adv') {
            fields.advantage = 1;
        } else if (advantage === 'dadv') {
            fields.disadvantage = 1;
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
        };
    },
};
