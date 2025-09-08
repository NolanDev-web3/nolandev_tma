export default class DBMgr {
    private static instance: DBMgr;

    public static getInstance(): DBMgr {
        if (!DBMgr.instance) {
            DBMgr.instance = new DBMgr();
        }
        return DBMgr.instance;
    }

    private constructor() {
        // private constructor to prevent instantiation
    }

    private db: IDBDatabase | null = null;
    public async openDB(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('dashfun', 1);

            request.onupgradeneeded = (event) => {
                this.db = (event.target as IDBOpenDBRequest).result;
                if (this.db) {
                    //id is "userId-gameId"
                    const store = this.db.createObjectStore('gamesave', { keyPath: 'id', autoIncrement: false });
                    store.createIndex("data", "data", { unique: false });
                    store.createIndex("timestamp", "timestamp", { unique: false });
                }
            };

            request.onsuccess = (event) => {
                this.db = (event.target as IDBOpenDBRequest).result;
                resolve();
            };

            request.onerror = (event) => {
                reject((event.target as IDBOpenDBRequest).error);
            };
        });
    }

    private openTransaction(storeName: string, mode: IDBTransactionMode = 'readonly'): IDBObjectStore | null {
        if (!this.db) {
            console.error('Database is not opened yet.');
            return null;
        }
        const transaction = this.db.transaction(storeName, mode);
        return transaction.objectStore(storeName);
    }

    public getGameSaveStore(mode: IDBTransactionMode = 'readonly'): IDBObjectStore | null {
        return this.openTransaction('gamesave', mode);
    }

}