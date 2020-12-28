import * as history from './history';
import * as macro from './macro';
import * as store from './macro_store';

const INPUT_ID = 'macroll-input';

const CHAT = document.getElementById('textchat-input')!;
const CHAT_INPUT = CHAT.getElementsByTagName('textarea')![0]!;
const CHAT_SUBMIT = CHAT.getElementsByTagName('button')![0]!;

let historyIndex = 0;
history.initialize([] as string[]);

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

function removeInputElement(input: HTMLInputElement): void {
    historyIndex = 0;
    input.remove();
}

function navigateHistory(input: HTMLInputElement, newIndex: number | null): void {
    if (newIndex !== null) {
        historyIndex = newIndex;
        input.value = history.get(historyIndex);
    }
}

function createInputElement(): HTMLInputElement {
    const input = document.createElement('input');
    input.id = INPUT_ID;
    input.addEventListener('keydown', event => {
        switch (event.key) {
            case 'Enter': {
                const macroInput = input.value;
                runMacro(macroInput);
                history.add(macroInput);
                history.updateCurrent('');
                removeInputElement(input);
                break;
            }
            case 'ArrowUp':
                navigateHistory(input, history.previous(historyIndex));
                break;
            case 'ArrowDown':
                navigateHistory(input, history.next(historyIndex));
                break;
        }
    });
    input.addEventListener('input', () => {
        if (historyIndex === 0) {
            history.updateCurrent(input.value);
        }
    });
    input.addEventListener('blur', () => {
        removeInputElement(input);
    });
    return input;
}

function runMacro(macroText: string): void {
    const lastMessageId = getLastMessageId();

    const parsed = macro.parseMacro(macroText);
    const func = new store.MacroStore().get(parsed.name);
    const result = func(...parsed.args);

    sendMessage(result);

    function executeOnComplete(): void {
        const newLastMessage = getLastMessage();
        if (newLastMessage === null || newLastMessage.dataset.messageid === lastMessageId) {
            setTimeout(executeOnComplete, 100 /* 100ms */);
        } else {
            const newResult = result.onComplete!(newLastMessage);
            if (newResult !== null) {
                sendMessage(newResult);
            }
        }
    }
    if ('onComplete' in result) {
        setTimeout(executeOnComplete, 100 /* 100ms */);
    }
}

function sendMessage(result: macro.IMacroResult): void {
    const message = toRoll20Syntax(result);
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

function getLastMessage(): HTMLElement | null {
    return document.querySelector('#textchat .content .message:last-child');
}

function getLastMessageId(): string {
    const msg = getLastMessage();
    if (msg === null) {
        return '';
    } else {
        return msg.dataset.messageid!;
    }
}
