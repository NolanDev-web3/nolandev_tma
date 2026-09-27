import { FeaturedPoolCard, type PoolCardProps } from './FeaturedPoolCard';
import type { LaunchPool } from '../data/types';

export const PoolList = ({ pools, savedIds, onOpen, onSave, savingId }: {
  pools: LaunchPool[]; savedIds: string[];
  onOpen: PoolCardProps['onOpen']; onSave: PoolCardProps['onSave']; savingId: string | null;
}) => <div className="lp-pool-list">{pools.map(pool => <FeaturedPoolCard key={pool.id} pool={pool} saved={savedIds.includes(pool.id)} onOpen={onOpen} onSave={onSave} saving={savingId !== null} />)}</div>;
