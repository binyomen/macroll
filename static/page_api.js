const CHAT = document.getElementById('textchat-input');
const CHAT_INPUT = CHAT.getElementsByTagName('textarea')[0];
const CHAT_SUBMIT = CHAT.getElementsByTagName('button')[0];

const modules = {};

document.body.addEventListener('macroll-run-macro', async e => {
    const macroCall = JSON.parse(e.detail);
    for (let i = 0; i < macroCall.args.length; i += 1) {
        if (typeof macroCall.args[i] === 'object') {
            macroCall.args[i] = new RollExpr(toRollExpression(macroCall.args[i]));
        }
    }

    const [mod, macro] = macroCall.name.split('.', 2);
    await modules[mod][macro](...macroCall.args);
});

export function fromModuleName(moduleName) {
    modules[moduleName] = {};
    return {
        registerMacro: registerMacroFactory(moduleName),
        sendCommand: sendCommandFactory(moduleName),
        num,
        roll,
        mod: modules,
    };
}

function doRollExprOperation(op, lhs, rhs) {
    if (typeof rhs === 'number') {
        return doRollExprOperation(op, lhs, new RollExpr(rhs));
    } else {
        return new RollExpr(new RollOperator(op, lhs.inner, rhs.inner));
    }
}

class RollExpr {
    constructor(inner) {
        this.kind = 'expr';
        this.inner = inner;
    }

    plus(other) {
        return doRollExprOperation('+', this, other);
    }

    minus(other) {
        return doRollExprOperation('-', this, other);
    }

    multipliedBy(other) {
        return doRollExprOperation('*', this, other);
    }

    dividedBy(other) {
        return doRollExprOperation('/', this, other);
    }

    toString() {
        return `[[${this.inner}]]`;
    }
}

class Roll {
    constructor(numDice, dieValue) {
        this.kind = 'roll';
        this.numDice = numDice;
        this.dieValue = dieValue;
    }

    toString() {
        return `${this.numDice}d${this.dieValue}`;
    }
}

class RollOperator {
    constructor(op, lhs, rhs) {
        this.kind = 'op';
        this.op = op;
        this.lhs = lhs;
        this.rhs = rhs;
    }

    toString() {
        return `(${this.lhs} ${this.op} ${this.rhs})`;
    }
}

function num(value) {
    return new RollExpr(value);
}

function roll(numDice, dieValue) {
    return new RollExpr(new Roll(numDice, dieValue));
}

function toRollExpression(structure) {
    switch (structure.kind) {
        case 'op': {
            const lhs = toRollExpression(structure.lhs);
            const rhs = toRollExpression(structure.rhs);
            return new RollOperator(structure.op, lhs, rhs);
        }
        case 'num':
            return structure.value;
        case 'roll':
            return new Roll(structure.numDice, structure.dieValue);
    }
}

function registerMacroFactory(moduleName) {
    return (macroName, macro) => {
        modules[moduleName][macroName] = macro;
    };
}

function sendCommandFactory(moduleName) {
    return async (command) => {
        return new Promise(resolve => {
            const lastMessageId = getLastMessageId();
            sendMessage(command);

            function executeOnComplete() {
                const newLastMessage = getLastMessage();
                if (newLastMessage === null || newLastMessage.dataset.messageid === lastMessageId) {
                    setTimeout(executeOnComplete, 100 /* 100ms */);
                } else {
                    resolve(newLastMessage);
                }
            }
            setTimeout(executeOnComplete, 100 /* 100ms */);
        });
    };
}

function sendMessage(command) {
    const message = toRoll20Syntax(command);

    // For some reason there's an invisible newline in an empty chat box.
    const oldText = CHAT_INPUT.value.trim();
    CHAT_INPUT.value = message;
    CHAT_SUBMIT.click();

    // We reset the value in the next event loop because if we don't, the value
    // gets changed to a single newline for some reason.
    setTimeout(() => {
        CHAT_INPUT.value = oldText;
    }, 1);
}

function toRoll20Syntax(command) {
    if (typeof command === 'string') {
        return command;
    } else {
        let template = `&{template:${command.name}} `;
        for (const [key, value] of Object.entries(command.fields)) {
            template += `{{${key}=${value}}} `;
        }
        return template;
    }
}

function getLastMessage() {
    return document.querySelector('#textchat .content .message:last-child');
}

function getLastMessageId() {
    const msg = getLastMessage();
    if (msg === null) {
        return '';
    } else {
        return msg.dataset.messageid;
    }
}
