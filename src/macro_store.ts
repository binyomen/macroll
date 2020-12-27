import type {IMacroResult} from './macro';
import dnd from './builtins/dnd';

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-type-alias
type MacroFunction = (...args: any[]) => IMacroResult;

export interface IMacroStore {
    readonly get: (name: string) => MacroFunction;
}

export class MacroStore implements IMacroStore {
    // eslint-disable-next-line class-methods-use-this
    public get(name: string): MacroFunction {
        console.log(name);
        return dnd.attack;
    }
}
