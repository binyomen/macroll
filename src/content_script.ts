document.addEventListener('keydown', event => {
    if (event.altKey && event.shiftKey && event.key === 'M') {
        const element = createInputElement();
        document.body.appendChild(element);
        element.focus();
    }
});

function createInputElement(): HTMLInputElement {
    const element = document.createElement('input');
    element.id = 'macroll-input';
    return element;
}
