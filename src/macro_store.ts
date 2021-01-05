import {browser} from 'webextension-polyfill-ts';
import {getModules} from './storage';

export async function initialize(): Promise<void> {
    const dndResponse = await fetch(browser.runtime.getURL('builtins/dnd.js'));
    const dndCode = await dndResponse.text();
    addModuleToPage('dnd', dndCode);

    const modules = await getModules();
    for (const [moduleName, moduleContent] of Object.entries(modules)) {
        addModuleToPage(moduleName, moduleContent);
    }

    addModuleToPage('testmod', `
        macroll.registerMacro('shoot', async () => {
            const atkRoll = macroll.roll(1, 20).plus(5);
            const dmgRoll = macroll.roll(2, 4).plus(2);
            const newMessage = await macroll.mod.dnd.atk('shoot', atkRoll, dmgRoll, 'adv', 'Kaita');

            const damageElts = newMessage.querySelectorAll('.sheet-damage .inlinerollresult');
            const damage = Array.from(damageElts)
                .map(e => e.innerText)
                .map(s => Number.parseInt(s, 10))
                .reduce((acc, v) => acc + v, 0);
            await macroll.sendCommand(\`Total damage: $\{damage}\`);
        });
    `);
}

function addModuleToPage(name: string, content: string): void {
    const id = `macroll-module-${name}`;
    const existingScript = document.getElementById(id) as HTMLScriptElement | null;
    if (existingScript !== null) {
        existingScript.remove();
    }

    const pageApiSrc = browser.runtime.getURL('page_api.js');
    const newContent = `import * as pageApi from '${pageApiSrc}';
const macroll = pageApi.fromModuleName('${name}');
${content}`;

    const script = document.createElement('script');
    script.type = 'module';
    script.id = id;
    script.text = newContent;
    document.head.appendChild(script);
}
