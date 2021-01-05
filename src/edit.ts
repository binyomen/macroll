import {getModules, setModules} from './storage';

// eslint-disable-next-line @typescript-eslint/init-declarations
let MODULE_NAME_INPUT: HTMLInputElement;
// eslint-disable-next-line @typescript-eslint/init-declarations
let TEXT_ENTRY: HTMLTextAreaElement;
// eslint-disable-next-line @typescript-eslint/init-declarations
let SAVE_BUTTON: HTMLButtonElement;

window.addEventListener('load', () => {
    MODULE_NAME_INPUT = document.getElementById('module-name')! as HTMLInputElement;
    TEXT_ENTRY = document.getElementById('text-edit')! as HTMLTextAreaElement;
    SAVE_BUTTON = document.getElementById('save-button')! as HTMLButtonElement;

    const moduleName = window.location.hash.slice(1);
    const isNewModule = moduleName.length === 0;

    const moduleNameText = isNewModule ?
        'New module' :
        moduleName;

    MODULE_NAME_INPUT.value = moduleNameText;

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
    const shouldSave = isNewModule && Object.keys(modules).includes(moduleName) ?
        confirm(`There is already a module with the name ${moduleName}. Do you want to overwrite it?`) :
        true;

    if (shouldSave) {
        modules[moduleName] = TEXT_ENTRY.value;
        await setModules(modules);
    }
}
