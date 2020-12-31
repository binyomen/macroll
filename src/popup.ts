import {browser} from 'webextension-polyfill-ts';

window.addEventListener('load', () => {
    const modules = getModules();
    const moduleElts = Object.keys(modules).map(createModuleElement);

    const listElt = document.getElementById('module-list')!;
    for (const elt of moduleElts) {
        listElt.appendChild(elt);
    }
});

function getModules(): Record<string, string> {
    return {
        mod1: `
            macroll.registerMacro('shoot', async () => {
                await macroll.sendCommand('pew pew!');
            });
        `,
        mod2: `
            macroll.registerMacro('punch', async () => {
                await macroll.sendCommand('whack!');
            });
        `,
    };
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

async function openEditPage(moduleName: string): Promise<void> {
    const editUrl = browser.runtime.getURL(`edit.html#${moduleName}`);
    await browser.tabs.create({url: editUrl, active: true});
}
