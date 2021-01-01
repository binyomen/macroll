const CHAT = document.getElementById('textchat-input');
const CHAT_INPUT = CHAT.getElementsByTagName('textarea')[0];
const CHAT_SUBMIT = CHAT.getElementsByTagName('button')[0];

const modules = {};

document.body.addEventListener('macroll-run-macro', async e => {
    const macroCall = JSON.parse(e.detail);
    const [mod, macro] = macroCall.name.split('.', 2);
    await modules[mod][macro](...macroCall.args);
});

export function fromModuleName(moduleName) {
    modules[moduleName] = {};
    return {
        registerMacro: registerMacroFactory(moduleName),
        sendCommand: sendCommandFactory(moduleName),
        mod: modules,
    };
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
            const valueString = (() => {
                if (typeof value === 'object') {
                    return rollSetToString(value);
                } else {
                    return value.toString();
                }
            })();
            template += `{{${key}=${valueString}}} `;
        }
        return template;
    }
}

function rollSetToString(rollSet) {
    if (rollSet.rolls.length === 0) {
        return `[[${rollSet.modifier}]]`;
    } else {
        let rollString = `[[${rollToString(rollSet.rolls[0])}`;

        for (const roll of rollSet.rolls.slice(1)) {
            const op = roll.operator === 'Operator.Plus' ? '+' : '-';
            rollString += ` ${op} ${rollToString(roll)}`;
        }

        if (rollSet.modifier < 0) {
            rollString += ` - ${Math.abs(rollSet.modifier)}`;
        } else {
            rollString += ` + ${rollSet.modifier}`;
        }

        rollString += ']]';
        return rollString;
    }
}

function rollToString(roll) {
    return `${roll.numDice}d${roll.dieValue}`;
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
