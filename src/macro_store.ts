import {browser} from 'webextension-polyfill-ts';
import dnd from './builtins/dnd';

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-type-alias
type MacroFunction = (...args: any[]) => Promise<void>;

const macros: Record<string, Record<string, MacroFunction>> = {};

export function initialize(): void {
    macros.dnd = {};
    for (const name in dnd) {
        if (Object.prototype.hasOwnProperty.call(dnd, name)) {
            macros.dnd[name] = (dnd as Record<string, MacroFunction>)[name]!;
        }
    }

    addModuleToPage('testmod', 'console.log("in here");pageApi.testThisOut();');
}

export function get(name: string): MacroFunction {
    const [mod, macro] = name.split('.', 2);
    return macros[mod!]![macro!]!;
}

function addModuleToPage(name: string, content: string): void {
    const id = `macroll-module-${name}`;
    const existingScript = document.getElementById(id) as HTMLScriptElement | null;
    if (existingScript !== null) {
        existingScript.remove();
    }

    const pageApiSrc = browser.runtime.getURL('page_api.js');
    const newContent = `import * as pageApi from '${pageApiSrc}';${content}`;

    const script = document.createElement('script');
    script.type = 'module';
    script.id = id;
    script.innerText = newContent;
    document.head.appendChild(script);
}
