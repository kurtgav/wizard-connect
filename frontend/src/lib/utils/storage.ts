// Custom storage adapter for environments where localStorage is blocked (e.g. Private Browsing)
export class CustomStorage {
    private storage: Storage | null = null;
    private memoryStorage: Record<string, string> = {};

    constructor(storageKey?: string) {
        try {
            if (typeof window !== 'undefined') {
                this.storage = window.localStorage;
                // Test if localStorage works
                const testKey = `__storage_test_${storageKey || 'default'}__`;
                this.storage.setItem(testKey, 'test');
                this.storage.removeItem(testKey);
            }
        } catch (e) {
            this.storage = null;
        }
    }

    getItem(key: string): string | null {
        try {
            if (this.storage) return this.storage.getItem(key);
            return this.memoryStorage[key] || null;
        } catch (e) {
            return this.memoryStorage[key] || null;
        }
    }

    setItem(key: string, value: string): void {
        try {
            if (this.storage) {
                this.storage.setItem(key, value);
            } else {
                this.memoryStorage[key] = value;
            }
        } catch (e) {
            this.memoryStorage[key] = value;
        }
    }

    removeItem(key: string): void {
        try {
            if (this.storage) {
                this.storage.removeItem(key);
            } else {
                delete this.memoryStorage[key];
            }
        } catch (e) {
            delete this.memoryStorage[key];
        }
    }

    clear(): void {
        try {
            if (this.storage) {
                this.storage.clear();
            } else {
                this.memoryStorage = {};
            }
        } catch (e) {
            this.memoryStorage = {};
        }
    }
}

export const safeLocalStorage = new CustomStorage('ls');
