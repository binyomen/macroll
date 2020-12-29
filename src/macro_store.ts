import dnd from './builtins/dnd';

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-type-alias
type MacroFunction = (...args: any[]) => Promise<void>;

export interface IMacroStore {
    readonly get: (name: string) => MacroFunction;
}

export class MacroStore implements IMacroStore {
    private readonly macros: Record<string, Record<string, MacroFunction>> = {};

    public constructor() {
        this.macros.dnd = {};
        for (const name in dnd) {
            if (Object.prototype.hasOwnProperty.call(dnd, name)) {
                this.macros.dnd[name] = (dnd as Record<string, MacroFunction>)[name]!;
            }
        }
    }

    public get(name: string): MacroFunction {
        const [mod, macro] = name.split('.', 2);
        return this.macros[mod!]![macro!]!;
    }
}
