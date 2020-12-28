let backend: IHistoryBackend; // eslint-disable-line @typescript-eslint/init-declarations
let currentLine: string; // eslint-disable-line @typescript-eslint/init-declarations

interface IHistoryBackend {
    [i: number]: string;
    readonly length: number;
    readonly push: (s: string) => void;
}

export function initialize(initBackend: IHistoryBackend): void {
    backend = initBackend;
    currentLine = '';
}

export function updateCurrent(line: string): void {
    currentLine = line;
}

export function add(line: string): void {
    if (line !== backend[backend.length - 1]) {
        backend.push(line);
    }
}

export function get(index: number): string {
    if (index === 0) {
        return currentLine;
    } else {
        const internalIndex = indexToInternal(index);
        return backend[internalIndex]!;
    }
}

export function previous(index: number): number | null {
    const internalIndex = indexToInternal(index);
    if (internalIndex <= 0 || internalIndex > backend.length) {
        return null;
    } else {
        return index + 1;
    }
}

export function next(index: number): number | null {
    const internalIndex = indexToInternal(index);
    if (internalIndex < 0 || internalIndex >= backend.length) {
        return null;
    } else {
        return index - 1;
    }
}

function indexToInternal(index: number): number {
    return backend.length - 1 - index + 1;
}
