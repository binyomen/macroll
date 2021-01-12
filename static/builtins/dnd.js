macroll.registerMacro('atk', async (name, atk, dmg, dmgType, advantage = 'norm', charname = '') => {
    const fields = {
        attack: 1,
        damage: 1,
        rname: name,
        r1: atk,
        r2: atk,
        mod: getModifier(atk),
        dmg1: dmg,
        dmg1type: dmgType,
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

    return await macroll.sendCommand({name: 'atkdmg', fields});
});

macroll.registerMacro('chk', async (name, roll, advantage = 'norm', charname = '') => {
    const fields = {
        rname: name,
        r1: roll,
        r2: roll,
        mod: getModifier(roll),
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

    return await macroll.sendCommand({name: 'simple', fields});
});

function getModifier(roll) {
    const inner = roll.inner;
    if (macroll.isOperator(inner) &&
            ['+', '-'].includes(inner.op) &&
            macroll.isRoll(inner.lhs) &&
            macroll.isNumber(inner.rhs)) {
        return `${inner.op}${inner.rhs}`;
    } else {
        return roll.inner.toString();
    }
}
