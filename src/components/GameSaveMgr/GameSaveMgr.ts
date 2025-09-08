import { GameApi } from "@/utils/DashFunApi";
import DBMgr from "../DBMgr/DBMgr";
import Mutex from "../Mutex/Mutex";
import { UnloadingEvent } from "../Event/Events";

export class GameSaveData {
    id: string = "";
    data: { [key: string]: string } = {};
    timestamp: number = Date.now();

    constructor(savedata?: any) {
        if (savedata) {
            this.id = savedata.id;
            this.data = savedata.data;
            this.timestamp = savedata.timestamp;
        }
    }

    get(key: string): string {
        return this.data[key] ? btoa(this.data[key]) : "";
    }

    set(key: string, value: string): void {
        this.data[key] = value;
        this.timestamp = Date.now();
    }
}

const SAVE_TO_SERVER_INTERVAL = 1000 * 30;

export default class GameSaveMgr {

    private static instance: GameSaveMgr | null = null;

    public static getInstance(): GameSaveMgr {
        if (this.instance === null) {
            this.instance = new GameSaveMgr();
        }
        return this.instance;
    }

    private savedata: GameSaveData | null = null;
    private mutex = new Mutex();

    private userId: string = "";
    private userToken: string = "";
    private gameId: string = "";

    private saveTime: number = 0;
    private lastSaveTimestamp: number = 0;
    private intervalHandler: NodeJS.Timeout | null = null;

    private constructor() {
        this.intervalHandler = setInterval(() => {
            this.saveGameSaveData();
        }, SAVE_TO_SERVER_INTERVAL);

        UnloadingEvent.addListener(() => {
            this.saveTime = 0;
            this.saveGameSaveData();
            clearInterval(this.intervalHandler as NodeJS.Timeout);
        });

        // window.addEventListener('beforeunload', () => {
        //     this.saveTime = 0;
        //     this.saveGameSaveData();
        //     clearInterval(this.intervalHandler as NodeJS.Timeout);
        // });
    }

    public setContext(userId: string, userToken: string, gameId: string) {
        this.userId = userId;
        this.userToken = userToken;
        this.gameId = gameId;
        this.saveTime = Date.now();
        this.lastSaveTimestamp = 0;

    }

    public getUserContext(): { userId: string, userToken: string, gameId: string } {
        return {
            userId: this.userId,
            userToken: this.userToken,
            gameId: this.gameId,
        }
    }

    public async getGameSaveData(): Promise<GameSaveData> {
        const release = await this.mutex.acquire();
        try {
            const saveId = this.toSaveId(this.userId, this.gameId);
            if (this.savedata == null) {
                const dbSaved = await this.loadGameSaveData(this.userId, this.gameId);
                let serverString = await GameApi.getData(this.gameId, this.userToken, "gamesave");
                const serverSaved = new GameSaveData();
                serverSaved.id = saveId;


                if (serverString != null && serverString != "") {
                    serverString = atob(serverString);
                    if (serverString.startsWith("timestamp")) {
                        const serverTimestamp = parseInt(serverString.slice(9, 24), 10);
                        serverString = serverString.slice(24);
                        serverSaved.data = JSON.parse(serverString);
                        serverSaved.timestamp = serverTimestamp;
                    }
                } else {
                }

                console.log("serverString", serverString);
                console.log("dbSaved", dbSaved);
                console.log("serverSaved", serverSaved);

                if (dbSaved == null) {
                    this.savedata = serverSaved;
                } else {
                    if (dbSaved.timestamp > serverSaved.timestamp) {
                        this.savedata = dbSaved;
                    } else {
                        this.savedata = serverSaved;
                    }
                }

                if (this.savedata == null) {
                    this.savedata = new GameSaveData();
                    this.savedata.id = saveId;
                }
            }
            return this.savedata;
        } finally {
            release();
        }
    }

    public async saveGameSaveData(): Promise<void> {
        if (this.savedata == null) {
            return;
        }

        if (this.lastSaveTimestamp == this.savedata.timestamp) {
            return;
        }

        await this.saveGameSaveDataToDB(this.savedata);
        if (this.saveTime + SAVE_TO_SERVER_INTERVAL < Date.now()) {
            console.log("saving data to server....");
            const t = this.savedata.timestamp.toString().padStart(15, '0');
            const serverString = `timestamp${t}${JSON.stringify(this.savedata.data)}`;
            await GameApi.setData(this.gameId, this.userToken, "gamesave", serverString);
            this.saveTime = Date.now();
            this.lastSaveTimestamp = this.savedata.timestamp;
        }
    }

    private async loadGameSaveData(userId: string, gameId: string): Promise<GameSaveData | null> {
        // Implement the logic to load game save data here
        const store = DBMgr.getInstance().getGameSaveStore();
        if (store == null) {
            return null;
        }
        const saveId = this.toSaveId(userId, gameId);
        const request = store.get(saveId);
        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                if (request.result != null) {
                    const data = new GameSaveData(request.result);
                    resolve(data);
                } else {
                    resolve(null);
                }
            };
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    private async saveGameSaveDataToDB(data: GameSaveData): Promise<void> {
        const store = DBMgr.getInstance().getGameSaveStore('readwrite');
        if (store == null) {
            return;
        }

        const request = store.put(data);
        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                resolve();
            };
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    private toSaveId(userId: string, gameId: string): string {
        return `${userId}-${gameId}`;
    }

}