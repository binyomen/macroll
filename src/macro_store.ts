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

    addModuleToPage('testmod', 'console.log("hey, this works!");');
}

export function get(name: string): MacroFunction {
    const [mod, macro] = name.split('.', 2);
    return macros[mod!]![macro!]!;
}

function addModuleToPage(name: string, content: string): void {
    const id = `macroll-module-${name}`;
    const existingScript = document.getElementById(id) as HTMLScriptElement | null;
    if (existingScript !== null) {
        URL.revokeObjectURL(existingScript.src);
        existingScript.remove();
    }

    const script = document.createElement('script');
    script.type = 'module';
    script.id = id;
    // We need to use blob storage to get around content security policies.
    script.src = URL.createObjectURL(new Blob([content], {type: 'application/javascript'}));
    document.head.appendChild(script);
}
