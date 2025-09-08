class Mutex {
    private lock: Promise<void> = Promise.resolve();

    async acquire(): Promise<() => void> {
        let release: () => void;
        const newLock = new Promise<void>((resolve) => (release = resolve));

        const previousLock = this.lock;
        this.lock = newLock;

        await previousLock;
        return release!;
    }
}


export default Mutex;