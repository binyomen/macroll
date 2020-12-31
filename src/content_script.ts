import * as history from './history';
import * as macro from './macro';
import * as store from './macro_store';

const INPUT_ID = 'macroll-input';

let historyIndex = 0;
history.initialize(new history.SyncStorage());

store.initialize().catch(e => {
    console.log(e);
});

// eslint-disable-next-line @typescript-eslint/no-misused-promises
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
    history.updateCurrent('');
    input.remove();
}

async function navigateHistory(input: HTMLInputElement, newIndex: number | null): Promise<void> {
    if (newIndex !== null) {
        historyIndex = newIndex;
        input.value = await history.get(historyIndex);
        setTimeout((): void => {
            input.setSelectionRange(input.value.length, input.value.length);
        }, 1);
    }
}

function createInputElement(): HTMLInputElement {
    const input = document.createElement('input');
    input.id = INPUT_ID;
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    input.addEventListener('keydown', async event => {
        switch (event.key) {
            case 'Enter': {
                const macroInput = input.value;
                runMacro(macroInput);
                await history.add(macroInput);
                removeInputElement(input);
                break;
            }
            case 'ArrowUp':
                await navigateHistory(input, await history.previous(historyIndex));
                break;
            case 'ArrowDown':
                await navigateHistory(input, await history.next(historyIndex));
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
    const parsed = macro.parseMacro(macroText);
    const runMacroEvent =
        new CustomEvent('macroll-run-macro', {detail: JSON.stringify(parsed)});
    document.body.dispatchEvent(runMacroEvent);
}
