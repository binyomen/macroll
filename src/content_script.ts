import * as dnd from './builtins/dnd';
import * as macro from './macro';

const INPUT_ID = 'macroll-input';

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
    return input;
}

function runMacro(macroText: string): void {
    console.log(macroText);
    const roll = new macro.Roll(1, 20);
    const rollSet = new macro.RollSet([roll], -5);
    dnd.attack(rollSet, rollSet);
}
