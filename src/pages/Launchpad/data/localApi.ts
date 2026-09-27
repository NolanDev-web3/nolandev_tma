import { createPools } from './fixtures';
import { poolStatus, type Allocation, type LaunchpadApi, type LaunchPool, type Portfolio } from './types';

interface Store {
  version: 1;
  pools: LaunchPool[];
  portfolio: Portfolio;
  receipts: Record<string, { signature: string; allocation: Allocation }>;
}
export function createLocalLaunchpadApi(userId: string, storage: Storage = localStorage): LaunchpadApi {
  const key = `nolandev.launchpad.demo.v1:${userId}`;
  const fresh = (): Store => ({
    version: 1, pools: createPools(Date.now()), receipts: {},
    portfolio: {
      balanceCents: 90000, savedPoolIds: [],
      allocations: [{ poolId: 'forma', amountCents: 10000, tokenAmount: 1000, claimed: false, updatedAt: new Date().toISOString() }],
    },
  });
  const read = (): Store => {
    const raw = storage.getItem(key);
    if (!raw) { const state = fresh(); write(state); return state; }
    try {
      const state = JSON.parse(raw) as Store;
      if (state.version !== 1 || !Array.isArray(state.pools) || !Array.isArray(state.portfolio?.allocations)
        || !Array.isArray(state.portfolio.savedPoolIds) || !Number.isSafeInteger(state.portfolio.balanceCents) || !state.receipts) throw new Error();
      return state;
    } catch { throw new Error('Your saved data could not be read. Clear this site’s storage to start again.'); }
  };
  const write = (state: Store) => {
    try { storage.setItem(key, JSON.stringify(state)); }
    catch { throw new Error('Data could not be saved. Allow browser storage and try again.'); }
  };
  const wait = () => new Promise<void>(resolve => setTimeout(resolve, 220));
  const find = (state: Store, id: string) => {
    const pool = state.pools.find(p => p.id === id);
    if (!pool) throw new Error('This project is no longer available.');
    return pool;
  };
  const receipt = (state: Store, id: string, signature: string) => {
    if (!id || id.length > 128) throw new Error('A valid request ID is required.');
    const previous = state.receipts[id];
    if (previous && previous.signature !== signature) throw new Error('This request ID has already been used.');
    return previous?.allocation;
  };
  return {
    async listPools() { await wait(); return read().pools; },
    async getPool(id) { await wait(); return find(read(), id); },
    async getPortfolio() { await wait(); return read().portfolio; },
    async setSaved(poolId, saved) {
      await wait(); const state = read(); find(state, poolId);
      state.portfolio.savedPoolIds = state.portfolio.savedPoolIds.filter(id => id !== poolId);
      if (saved) state.portfolio.savedPoolIds.push(poolId);
      write(state);
    },
    async participate({ poolId, amountCents, requestId }) {
      await wait(); const state = read();
      const signature = `participate:${poolId}:${amountCents}`;
      const previous = receipt(state, requestId, signature);
      if (previous) return previous;
      const pool = find(state, poolId);
      const existing = state.portfolio.allocations.find(a => a.poolId === poolId);
      if (poolStatus(pool) !== 'live') throw new Error('This sale is not open.');
      if (!Number.isSafeInteger(amountCents) || amountCents < pool.minCents) throw new Error(`Minimum contribution is ${pool.minCents / 100} USDT.`);
      if (amountCents + (existing?.amountCents ?? 0) > pool.maxCents) throw new Error('This amount exceeds your individual allocation limit.');
      if (amountCents > state.portfolio.balanceCents) throw new Error('Your balance is too low.');
      if (amountCents + pool.raisedCents > pool.targetCents) throw new Error('This amount exceeds the remaining pool allocation.');
      const total = amountCents + (existing?.amountCents ?? 0);
      const allocation: Allocation = { poolId, amountCents: total, tokenAmount: total / pool.priceCents, claimed: false, updatedAt: new Date().toISOString() };
      state.portfolio.balanceCents -= amountCents;
      state.portfolio.allocations = [...state.portfolio.allocations.filter(a => a.poolId !== poolId), allocation];
      pool.raisedCents += amountCents;
      if (!existing) pool.participants += 1;
      state.receipts[requestId] = { signature, allocation };
      write(state); return allocation;
    },
    async claim(poolId, requestId) {
      await wait(); const state = read(); const signature = `claim:${poolId}`;
      const previous = receipt(state, requestId, signature);
      if (previous) return previous;
      const pool = find(state, poolId);
      const allocation = state.portfolio.allocations.find(a => a.poolId === poolId);
      if (!allocation) throw new Error('You do not have an allocation in this project.');
      if (Date.now() < Date.parse(pool.claimAt)) throw new Error('Claiming has not opened yet.');
      if (allocation.claimed) throw new Error('These tokens have already been claimed.');
      allocation.claimed = true; allocation.updatedAt = new Date().toISOString();
      state.receipts[requestId] = { signature, allocation };
      write(state); return allocation;
    },
  };
}
