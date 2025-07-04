class LocalStorageService {
    private _localStorage: Storage;

    private static instance: LocalStorageService;

    private constructor() {
        this._localStorage = window.localStorage;
    }

    public static getInstance(): LocalStorageService {
        if (!LocalStorageService.instance) {
            LocalStorageService.instance = new LocalStorageService();
        }
        return LocalStorageService.instance;
    }

    public setItem(key: string, value: any): void {
        try {
            this._localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Error setting item in local storage:', error);
        }
    }

    public getItem(key: string): string {
        try {
            const item = this._localStorage.getItem(key);
            return item ? JSON.parse(item) : "";
        } catch (error) {
            console.error('Error getting item from local storage:', error);
            return "";
        }
    }

    public removeItem(key: string): void {
        try {
            this._localStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing item from local storage:', error);
        }
    }
}

export default LocalStorageService;