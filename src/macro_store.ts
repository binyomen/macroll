import {browser} from 'webextension-polyfill-ts';

export async function initialize(): Promise<void> {
    const dndResponse = await fetch(browser.runtime.getURL('builtins/dnd.js'));
    const dndCode = await dndResponse.text();
    addModuleToPage('dnd', dndCode);

    const code = `
        macroll.registerMacro('testmac', async (name, roll) => {
            console.log('name: ' + name + ', roll: ' + JSON.stringify(roll));
            const newMessage = await macroll.sendCommand('Test command.');
            await macroll.sendCommand('Last message was: ' + newMessage.innerText);
        });
    `;
    addModuleToPage('testmod', code);
}

function addModuleToPage(name: string, content: string): void {
    const id = `macroll-module-${name}`;
    const existingScript = document.getElementById(id) as HTMLScriptElement | null;
    if (existingScript !== null) {
        existingScript.remove();
    }

    const pageApiSrc = browser.runtime.getURL('page_api.js');
    const newContent = `
        import * as pageApi from '${pageApiSrc}';
        const macroll = pageApi.fromModuleName('${name}');
        ${content}
    `;

    const script = document.createElement('script');
    script.type = 'module';
    script.id = id;
    script.innerText = newContent;
    document.head.appendChild(script);
}
