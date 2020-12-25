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
            submitMacro(input.value);
            input.remove();
        }
    });
    return input;
}

function submitMacro(macro: string): void {
    console.log(macro);
}