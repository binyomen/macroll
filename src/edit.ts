import * as monaco from 'monaco-editor';
import {getModules, setModules} from './storage';

// eslint-disable-next-line @typescript-eslint/init-declarations
let MODULE_NAME_INPUT: HTMLInputElement;
// eslint-disable-next-line @typescript-eslint/init-declarations
let SAVE_BUTTON: HTMLButtonElement;

// eslint-disable-next-line @typescript-eslint/init-declarations
let EDITOR: monaco.editor.IStandaloneCodeEditor;

const DEFAULT_CONTENT = `macroll.registerMacro('punch_real_hard', async () => {
    const atkRoll = macroll.roll(1, 20).plus(10);
    const dmgRoll = macroll.roll(5, 12).plus(7);
    await macroll.mod.dnd.atk('punch', atkRoll, dmgRoll, 'bludgeoning', 'adv');
    await macroll.sendCommand('Boom!');
});`;

// eslint-disable-next-line @typescript-eslint/no-misused-promises
window.addEventListener('load', async () => {
    MODULE_NAME_INPUT = document.getElementById('module-name')! as HTMLInputElement;
    SAVE_BUTTON = document.getElementById('save-button')! as HTMLButtonElement;

    EDITOR = monaco.editor.create(document.getElementById('editor')!, {
        value: DEFAULT_CONTENT,
        language: 'javascript',
        theme: 'vs-dark',
    });

    const moduleName = window.location.hash.slice(1);
    const isNewModule = moduleName.length === 0;

    const moduleNameText = isNewModule ?
        'newmod' :
        moduleName;

    MODULE_NAME_INPUT.value = moduleNameText;

    const modules = await getModules();
    if (moduleName in modules) {
        EDITOR.setValue(modules[moduleName]!);
    }

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    SAVE_BUTTON.addEventListener('click', async () => {
        await saveModule(isNewModule);
    });
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    SAVE_BUTTON.addEventListener('keydown', async e => {
        if (e.key === 'Enter' || e.key === 'Space') {
            await saveModule(isNewModule);
        }
    });
});

async function saveModule(isNewModule: boolean): Promise<void> {
    const modules = await getModules();
    const moduleName = MODULE_NAME_INPUT.value;
    const shouldSave = isNewModule && (moduleName in modules) ?
        confirm(`There is already a module with the name ${moduleName}. Do you want to overwrite it?`) :
        true;

    if (shouldSave) {
        modules[moduleName] = EDITOR.getValue();
        await setModules(modules);
    }
}
