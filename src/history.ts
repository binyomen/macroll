import {browser} from 'webextension-polyfill-ts';

let backend: IHistoryBackend; // eslint-disable-line @typescript-eslint/init-declarations
let currentLine: string; // eslint-disable-line @typescript-eslint/init-declarations

interface IHistoryBackend {
    readonly get: (i: number) => Promise<string | undefined>;
    readonly length: () => Promise<number>;
    readonly push: (s: string) => Promise<void>;
}

export function initialize(initBackend: IHistoryBackend): void {
    backend = initBackend;
    currentLine = '';
}

export function updateCurrent(line: string): void {
    currentLine = line;
}

export async function add(line: string): Promise<void> {
    if (line !== await backend.get((await backend.length()) - 1)) {
        await backend.push(line);
    }
}

export async function get(index: number): Promise<string> {
    if (index === 0) {
        return currentLine;
    } else {
        const internalIndex = await indexToInternal(index);
        return (await backend.get(internalIndex))!;
    }
}

export async function previous(index: number): Promise<number | null> {
    const internalIndex = await indexToInternal(index);
    if (internalIndex <= 0 || internalIndex > await backend.length()) {
        return null;
    } else {
        return index + 1;
    }
}

export async function next(index: number): Promise<number | null> {
    const internalIndex = await indexToInternal(index);
    if (internalIndex < 0 || internalIndex >= await backend.length()) {
        return null;
    } else {
        return index - 1;
    }
}

async function indexToInternal(index: number): Promise<number> {
    return (await backend.length()) - 1 - index + 1;
}

export class SyncStorage implements IHistoryBackend {
    public async get(i: number): Promise<string | undefined> {
        const arr = await this.getArr();
        return arr[i];
    }

    public async length(): Promise<number> {
        const arr = await this.getArr();
        return arr.length;
    }

    public async push(s: string): Promise<void> {
        const arr = await this.getArr();
        arr.push(s);
        await browser.storage.sync.set({history: arr});
    }

    // eslint-disable-next-line class-methods-use-this
    private async getArr(): Promise<string[]> {
        const results = await browser.storage.sync.get('history');
        if ('history' in results) {
            return results.history as string[];
        } else {
            await browser.storage.sync.set({history: []});
            return [];
        }
    }
}
