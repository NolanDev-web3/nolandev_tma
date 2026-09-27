export type PoolStatus = 'live' | 'upcoming' | 'ended';
export interface LaunchPool {
  id: string;
  name: string;
  symbol: string;
  category: string;
  network: string;
  color: string;
  description: string;
  summary: string;
  priceCents: number;
  targetCents: number;
  raisedCents: number;
  minCents: number;
  maxCents: number;
  startsAt: string;
  endsAt: string;
  claimAt: string;
  featured: boolean;
  participants: number;
  vesting: string;
  highlights: string[];
}
export interface Allocation {
  poolId: string;
  amountCents: number;
  tokenAmount: number;
  claimed: boolean;
  updatedAt: string;
}
export interface Portfolio {
  balanceCents: number;
  savedPoolIds: string[];
  allocations: Allocation[];
}
export interface ParticipateRequest {
  poolId: string;
  amountCents: number;
  /** Reuse this key when retrying the same operation. */
  requestId: string;
}
/** All monetary values are integer USDT cents; timestamps are ISO 8601 UTC. */
export interface LaunchpadApi {
  listPools(): Promise<LaunchPool[]>;
  getPool(id: string): Promise<LaunchPool>;
  getPortfolio(): Promise<Portfolio>;
  setSaved(poolId: string, saved: boolean): Promise<void>;
  participate(request: ParticipateRequest): Promise<Allocation>;
  claim(poolId: string, requestId: string): Promise<Allocation>;
}
export const poolStatus = (pool: LaunchPool, now = Date.now()): PoolStatus =>
  now < Date.parse(pool.startsAt) ? 'upcoming' : now >= Date.parse(pool.endsAt) ? 'ended' : 'live';
export const money = (cents: number) => (cents / 100).toLocaleString('en-US', { maximumFractionDigits: 2 });
export const tokens = (amount: number) => amount.toLocaleString('en-US', { maximumFractionDigits: 2 });
