import * as macro from './macro';
import * as store from './macro_store';

const INPUT_ID = 'macroll-input';

const CHAT = document.getElementById('textchat-input')!;
const CHAT_INPUT = CHAT.getElementsByTagName('textarea')![0]!;
const CHAT_SUBMIT = CHAT.getElementsByTagName('button')![0]!;

document.addEventListener('keydown', event => {
    if (event.altKey &&
            event.shiftKey &&
            event.key === 'M' &&
            document.getElementById(INPUT_ID) === null) {
        const input = createInputElement();
        document.body.appendChild(input);
        input.focus();
    }
});

function createInputElement(): HTMLInputElement {
    const input = document.createElement('input');
    input.id = INPUT_ID;
    input.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            runMacro(input.value);
            input.remove();
        }
    });
    input.addEventListener('blur', () => {
        input.remove();
    });
    return input;
}

function runMacro(macroText: string): void {
    const parsed = macro.parseMacro(macroText);
    const func = new store.MacroStore().get(parsed.name);
    const message = toRoll20Syntax(func(...parsed.args));
    console.log(message);

    const oldText = CHAT_INPUT.value;
    CHAT_INPUT.value = message;
    CHAT_SUBMIT.click();
    CHAT_INPUT.value = oldText;
}

function toRoll20Syntax(result: macro.IMacroResult): string {
    const lines = [];
    for (const command of result.commands) {
        if (typeof command === 'string') {
            lines.push(command);
        } else {
            let template = `&{template:${command.name}} `;
            for (const [key, value] of Object.entries(command.fields)) {
                template += `{{${key}=${value}}} `;
            }
            lines.push(template);
        }
    }
    return lines.join('\n');
}
