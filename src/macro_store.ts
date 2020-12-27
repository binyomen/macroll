import type {IMacroResult} from './macro';
import dnd from './builtins/dnd';

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-type-alias
type MacroFunction = (...args: any[]) => IMacroResult;

export interface IMacroStore {
    readonly get: (name: string) => MacroFunction;
}

export class MacroStore implements IMacroStore {
    private readonly macros: Record<string, MacroFunction> = {};

    public constructor() {
        for (const name in dnd) {
            if (Object.prototype.hasOwnProperty.call(dnd, name)) {
                this.macros[name] = (dnd as Record<string, MacroFunction>)[name]!;
            }
        }
    }

    public get(name: string): MacroFunction {
        return this.macros[name]!;
    }
}
