let backend: IHistoryBackend; // eslint-disable-line @typescript-eslint/init-declarations
let currentLine: string; // eslint-disable-line @typescript-eslint/init-declarations

interface IHistoryBackend {
    [i: number]: string;
    readonly length: number;
    readonly push: (s: string) => void;
}

export async function initialize(initBackend: IHistoryBackend): Promise<void> {
    backend = initBackend;
    currentLine = '';
    return Promise.resolve();
}

export function updateCurrent(line: string): void {
    currentLine = line;
}

export async function add(line: string): Promise<void> {
    if (line !== backend[backend.length - 1]) {
        backend.push(line);
    }
    return Promise.resolve();
}

export async function get(index: number): Promise<string> {
    if (index === 0) {
        return Promise.resolve(currentLine);
    } else {
        const internalIndex = indexToInternal(index);
        return Promise.resolve(backend[internalIndex]!);
    }
}

export async function previous(index: number): Promise<number | null> {
    const internalIndex = indexToInternal(index);
    if (internalIndex <= 0 || internalIndex > backend.length) {
        return Promise.resolve(null);
    } else {
        return Promise.resolve(index + 1);
    }
}

export async function next(index: number): Promise<number | null> {
    const internalIndex = indexToInternal(index);
    if (internalIndex < 0 || internalIndex >= backend.length) {
        return Promise.resolve(null);
    } else {
        return Promise.resolve(index - 1);
    }
}

function indexToInternal(index: number): number {
    return backend.length - 1 - index + 1;
}
