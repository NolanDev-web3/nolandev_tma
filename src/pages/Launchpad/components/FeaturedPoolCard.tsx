import { ArrowUpRight, Bookmark, Clock3, Orbit, Sprout, Sparkles, Layers3 } from 'lucide-react';
import { money, poolStatus, type LaunchPool } from '../data/types';
import { ProgressBar } from './ProgressBar';

export const PoolLogo = ({ pool, large = false }: { pool: LaunchPool; large?: boolean }) => {
  const Icon = { mint: Orbit, purple: Sprout, orange: Sparkles, blue: Layers3 }[pool.color] ?? Orbit;
  return <span className={`lp-logo lp-${pool.color} ${large ? 'lp-logo-large' : ''}`}><Icon size={large ? 38 : 25} strokeWidth={1.6} /></span>;
};
export const StatusBadge = ({ pool }: { pool: LaunchPool }) => {
  const status = poolStatus(pool);
  return <span className={`lp-status lp-status-${status}`}><span />{status === 'live' ? 'Live now' : status === 'upcoming' ? 'Upcoming' : 'Ended'}</span>;
};
export const dateLabel = (date: string) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
export function timeLabel(pool: LaunchPool): string {
  const status = poolStatus(pool);
  if (status === 'ended') return `Ended ${dateLabel(pool.endsAt)}`;
  if (status === 'upcoming') return `Opens ${dateLabel(pool.startsAt)}`;
  const hours = Math.max(1, Math.ceil((Date.parse(pool.endsAt) - Date.now()) / 3600000));
  return hours >= 24 ? `${Math.floor(hours / 24)}d ${hours % 24}h left` : `${hours}h left`;
}
export interface PoolCardProps {
  pool: LaunchPool;
  saved: boolean;
  onOpen: (pool: LaunchPool) => void;
  onSave: (pool: LaunchPool) => void;
  saving?: boolean;
  featured?: boolean;
}
export const FeaturedPoolCard = ({ pool, saved, onOpen, onSave, saving, featured = false }: PoolCardProps) => {
  const progress = pool.raisedCents / pool.targetCents * 100;
  return <article className={`lp-pool-card ${featured ? 'lp-featured' : ''}`}>
    {featured && <div className="lp-featured-label"><Sparkles size={13} /> IN THE SPOTLIGHT <span>01 / 01</span></div>}
    <div className="lp-card-heading">
      <PoolLogo pool={pool} large={featured} />
      <div className="lp-project-name"><h3><button onClick={() => onOpen(pool)}>{pool.name}</button></h3><span>{pool.symbol} <b>·</b> {pool.category}</span></div>
      <button className={`lp-icon-button ${saved ? 'is-saved' : ''}`} onClick={() => onSave(pool)} disabled={saving} aria-label={`${saved ? 'Unsave' : 'Save'} ${pool.name}`} aria-pressed={saved}><Bookmark size={19} fill={saved ? 'currentColor' : 'none'} /></button>
    </div>
    <p className="lp-summary">{pool.summary}</p>
    <div className="lp-card-meta"><StatusBadge pool={pool} /><span><Clock3 size={13} />{timeLabel(pool)}</span></div>
    <div className="lp-raise-label"><strong>{money(pool.raisedCents)} <small>USDT raised</small></strong><span>{Math.round(progress)}%</span></div>
    <ProgressBar progress={progress} />
    <div className="lp-card-bottom"><div><span>Token price</span><strong>{money(pool.priceCents)} USDT</strong></div><button className={featured ? 'lp-button lp-primary' : 'lp-button lp-secondary'} onClick={() => onOpen(pool)}>View pool <ArrowUpRight size={16} /></button></div>
  </article>;
};
