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
}

export function get(name: string): MacroFunction {
    const [mod, macro] = name.split('.', 2);
    return macros[mod!]![macro!]!;
}
