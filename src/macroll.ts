import type {MacroCommand} from './macro';

const CHAT = document.getElementById('textchat-input')!;
const CHAT_INPUT = CHAT.getElementsByTagName('textarea')![0]!;
const CHAT_SUBMIT = CHAT.getElementsByTagName('button')![0]!;

export async function sendCommand(command: MacroCommand): Promise<HTMLElement> {
    return new Promise(resolve => {
        const lastMessageId = getLastMessageId();
        sendMessage(command);

        function executeOnComplete(): void {
            const newLastMessage = getLastMessage();
            if (newLastMessage === null || newLastMessage.dataset.messageid === lastMessageId) {
                setTimeout(executeOnComplete, 100 /* 100ms */);
            } else {
                resolve(newLastMessage);
            }
        }
        setTimeout(executeOnComplete, 100 /* 100ms */);
    });
}

function sendMessage(command: MacroCommand): void {
    const message = toRoll20Syntax(command);

    // For some reason there's an invisible newline in an empty chat box.
    const oldText = CHAT_INPUT.value.trim();
    CHAT_INPUT.value = message;
    CHAT_SUBMIT.click();
    CHAT_INPUT.value = oldText;
}

function toRoll20Syntax(command: MacroCommand): string {
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