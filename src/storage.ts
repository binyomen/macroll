import {browser} from 'webextension-polyfill-ts';

export async function getHistory(): Promise<string[]> {
    const results = await browser.storage.sync.get('history');
    if ('history' in results) {
        return results.history as string[];
    } else {
        await browser.storage.sync.set({history: []});
        return [];
    }
}

export async function setHistory(history: string[]): Promise<void> {
    await browser.storage.sync.set({history});
}

export async function getModules(): Promise<Record<string, string>> {
    const results = await browser.storage.sync.get('modules');
    if ('modules' in results) {
        return results.modules as Record<string, string>;
    } else {
        await browser.storage.sync.set({modules: {}});
        return {};
    }
}

export async function setModules(modules: Record<string, string>): Promise<void> {
    await browser.storage.sync.set({modules});
}
