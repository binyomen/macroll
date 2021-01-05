import {browser} from 'webextension-polyfill-ts';
import {getModules} from './storage';

// eslint-disable-next-line @typescript-eslint/init-declarations
let NEW_MODULE_BUTTON: HTMLButtonElement;
// eslint-disable-next-line @typescript-eslint/init-declarations
let MODULE_LIST: HTMLUListElement;

// eslint-disable-next-line @typescript-eslint/no-misused-promises
window.addEventListener('load', async () => {
    NEW_MODULE_BUTTON = document.getElementById('new-module')! as HTMLButtonElement;
    MODULE_LIST = document.getElementById('module-list')! as HTMLUListElement;

    setupNewModuleButton();

    const modules = await getModules();
    const moduleElts = Object.keys(modules).map(createModuleElement);

    for (const elt of moduleElts) {
        MODULE_LIST.appendChild(elt);
    }
});

function setupNewModuleButton(): void {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    NEW_MODULE_BUTTON.addEventListener('click', async () => {
        await openEditPage(null);
    });
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    NEW_MODULE_BUTTON.addEventListener('keydown', async e => {
        if (e.key === 'Enter' || e.key === 'Space') {
            await openEditPage(null);
        }
    });
}

function createModuleElement(moduleName: string): HTMLLIElement {
    const li = document.createElement('li');

    li.appendChild(document.createTextNode(moduleName));

    const editButton = document.createElement('button');
    editButton.innerText = 'E';
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    editButton.addEventListener('click', async () => {
        await openEditPage(moduleName);
    });
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    editButton.addEventListener('keydown', async e => {
        if (e.key === 'Enter' || e.key === 'Space') {
            await openEditPage(moduleName);
        }
    });
    li.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.innerText = 'X';
    li.appendChild(deleteButton);

    return li;
}

async function openEditPage(moduleName: string | null): Promise<void> {
    const editUrl = moduleName === null ?
        'edit.html#' :
        `edit.html#${moduleName}`;
    await browser.tabs.create({url: browser.runtime.getURL(editUrl), active: true});
}
