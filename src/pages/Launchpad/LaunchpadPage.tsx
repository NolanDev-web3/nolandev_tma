import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Bookmark, CheckCircle2, ChevronRight, Compass, Layers3, Search, Wallet, X } from 'lucide-react';
import { useKeepAliveContext } from 'keepalive-for-react';
import { useInRouterContext } from 'react-router-dom';
import { useDashFunUser } from '@/components/DashFun/DashFunUser';
import { createLaunchpadApi } from './data/api';
import { money, poolStatus, tokens, type LaunchPool, type PoolStatus, type Portfolio } from './data/types';
import { dateLabel, FeaturedPoolCard, PoolLogo } from './components/FeaturedPoolCard';
import { PoolList } from './components/PoolList';
import { PoolDetail } from './components/PoolDetail';
import ProfileHeader from '../GameCenterPage/Components/ProfileHeader';
import './Launchpad.css';

type View = 'explore' | 'saved' | 'allocations';
type Filter = 'all' | PoolStatus;
export const LaunchpadPage = () => {
  const user = useDashFunUser();
  const { active } = useKeepAliveContext();
  const inRouter = useInRouterContext();
  const visible = !inRouter || active;
  const api = useMemo(() => createLaunchpadApi(user?.id ?? 'preview'), [user?.id]);
  const [pools, setPools] = useState<LaunchPool[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [view, setView] = useState<View>('explore');
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const saveLock = useRef(false);
  const [notice, setNotice] = useState('');
  const [, setClock] = useState(0);
  const load = useCallback(async () => {
    const [projects, account] = await Promise.all([api.listPools(), api.getPortfolio()]);
    setPools(projects); setPortfolio(account);
  }, [api]);
  const refresh = useCallback(async () => {
    setLoading(true); setError('');
    try { await load(); } catch (err) { setError(err instanceof Error ? err.message : 'Unable to load projects. Please try again.'); }
    finally { setLoading(false); }
  }, [load]);
  useEffect(() => {
    if (visible) void refresh();
    else setSelectedId(null);
  }, [refresh, visible]);
  useEffect(() => {
    if (!visible) return;
    const timer = window.setInterval(() => setClock(value => value + 1), 30000);
    return () => clearInterval(timer);
  }, [visible]);
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(''), 3500); return () => clearTimeout(timer); }, [notice]);
  const save = async (pool: LaunchPool) => {
    if (!portfolio || saveLock.current) return;
    saveLock.current = true; setSavingId(pool.id); setError('');
    const saved = !portfolio.savedPoolIds.includes(pool.id);
    try {
      await api.setSaved(pool.id, saved); await load();
      setNotice(saved ? `${pool.name} added to Saved` : `${pool.name} removed from Saved`);
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to save project.'); }
    finally { saveLock.current = false; setSavingId(null); }
  };
  const selected = pools.find(pool => pool.id === selectedId);
  const filtered = pools.filter(pool => (filter === 'all' || poolStatus(pool) === filter) && (view !== 'saved' || portfolio?.savedPoolIds.includes(pool.id)) && `${pool.name} ${pool.symbol} ${pool.category}`.toLowerCase().includes(query.trim().toLowerCase()));
  const featured = view === 'explore' && filter === 'all' && !query.trim() ? filtered.find(pool => pool.featured && poolStatus(pool) === 'live') : undefined;
  const list = filtered.filter(pool => pool.id !== featured?.id);
  const allocations = portfolio?.allocations ?? [];
  const totalCents = allocations.reduce((sum, allocation) => sum + allocation.amountCents, 0);
  const claimable = allocations.filter(a => !a.claimed && pools.some(p => p.id === a.poolId && Date.parse(p.claimAt) <= Date.now())).length;
  return <div className="lp-app">
    <ProfileHeader />
    <header className="lp-header mt-5"><div className="lp-brandline"><span className="lp-eyebrow">NOLAN / LAUNCHPAD</span></div><div className="lp-titleline"><div><h1>Early starts here<span>.</span></h1><p>Discover projects. Be part of what’s next.</p></div><div className="lp-header-orbit" aria-hidden="true"><ArrowUpRight size={26} /></div></div></header>
    <div className="lp-wallet-strip"><span className="lp-wallet-icon"><Wallet size={18} /></span><div><span>Available balance</span><strong>{portfolio ? money(portfolio.balanceCents) : '—'} <small>USDT</small></strong></div><button onClick={() => setView('allocations')} aria-label="View my allocations"><span>My allocations</span><ChevronRight size={17} /></button></div>
    <nav className="lp-view-tabs" aria-label="Launchpad sections">{([{ id: 'explore', label: 'Explore', icon: Compass }, { id: 'saved', label: 'Saved', icon: Bookmark }, { id: 'allocations', label: 'My allocations', icon: Layers3 }] as const).map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setView(id)} aria-current={view === id ? 'page' : undefined} className={view === id ? 'is-active' : ''}><Icon size={16} />{label}{id === 'saved' && !!portfolio?.savedPoolIds.length && <span className="lp-tab-count">{portfolio.savedPoolIds.length}</span>}</button>)}</nav>
    {error && <div className="lp-error-banner" role="alert"><span>{error}</span><button onClick={() => void refresh()}>Retry</button></div>}
    {loading ? <div className="lp-loading" role="status" aria-label="Loading projects"><div /><div /><div /><span>Finding your next early start…</span></div> : portfolio && <>
      {view === 'allocations' ? <>
        <div className="lp-section-heading"><div><h2>Your early moves</h2><p>All your allocations, in one place.</p></div><span className="lp-count">{allocations.length}</span></div>
        <div className="lp-portfolio-stats"><div><span>Total contributed</span><strong>{money(totalCents)} <small>USDT</small></strong></div><div><span>Ready to claim</span><strong>{claimable} <small>{claimable === 1 ? 'pool' : 'pools'}</small></strong></div></div>
        {allocations.length === 0 ? <EmptyState view="allocations" onExplore={() => setView('explore')} /> : <div className="lp-allocation-list">{allocations.map(allocation => {
          const pool = pools.find(p => p.id === allocation.poolId); if (!pool) return null;
          const ready = !allocation.claimed && Date.parse(pool.claimAt) <= Date.now();
          return <button key={pool.id} className="lp-allocation-card" onClick={() => setSelectedId(pool.id)}><div className="lp-card-heading"><PoolLogo pool={pool} /><div className="lp-project-name"><h3>{pool.name}</h3><span>{money(allocation.amountCents)} USDT contributed</span></div><ChevronRight size={19} /></div><div className="lp-allocation-value"><strong>{tokens(allocation.tokenAmount)} <small>{pool.symbol}</small></strong><span className={ready ? 'lp-claim-ready' : 'lp-muted'}>{allocation.claimed ? <><CheckCircle2 size={14} /> Claimed</> : ready ? <><ArrowDownLeft size={14} /> Claim now</> : `Claim ${dateLabel(pool.claimAt)}`}</span></div></button>;
        })}</div>}
        <p className="lp-footnote">Your account has 900 USDT available and 100 USDT allocated to Forma. Tokens can be claimed according to the release schedule.</p>
      </> : <>
        <div className="lp-discovery-tools"><div className="lp-search"><Search size={17} /><input aria-label="Search projects" placeholder="Search projects" value={query} onChange={e => setQuery(e.target.value)} />{query && <button aria-label="Clear search" onClick={() => setQuery('')}><X size={16} /></button>}</div><div className="lp-filter-tabs" aria-label="Filter pools by status">{(['all', 'live', 'upcoming', 'ended'] as const).map(item => <button key={item} onClick={() => setFilter(item)} aria-pressed={filter === item} className={filter === item ? 'is-active' : ''}>{item === 'all' ? 'All pools' : item === 'live' ? <><span className="lp-live-dot" /> Live</> : item === 'upcoming' ? 'Upcoming' : 'Ended'}</button>)}</div></div>
        {featured && <FeaturedPoolCard pool={featured} featured saved={portfolio.savedPoolIds.includes(featured.id)} onSave={pool => void save(pool)} onOpen={pool => setSelectedId(pool.id)} saving={savingId !== null} />}
        <div className="lp-section-heading"><div><h2>{view === 'saved' ? 'Your watchlist' : featured ? 'More to discover' : filter === 'all' ? 'Explore pools' : filter === 'live' ? 'Live pools' : filter === 'upcoming' ? 'Coming soon' : 'Completed pools'}</h2>{view === 'saved' && <p>Keep the projects you like close.</p>}</div><span className="lp-count">{list.length}</span></div>
        {filtered.length === 0 ? <EmptyState view={view} filtered={!!query || filter !== 'all'} onExplore={() => { setView('explore'); setFilter('all'); setQuery(''); }} /> : <PoolList pools={list} savedIds={portfolio.savedPoolIds} onOpen={pool => setSelectedId(pool.id)} onSave={pool => void save(pool)} savingId={savingId} />}
        <p className="lp-footnote">A first look at what’s next.</p>
      </>}
    </>}
    {notice && <div className="lp-toast" role="status"><CheckCircle2 size={17} />{notice}</div>}
    {visible && selected && portfolio && <PoolDetail key={selected.id} pool={selected} portfolio={portfolio} onClose={() => setSelectedId(null)} onParticipate={async (amountCents, requestId) => { const result = await api.participate({ poolId: selected.id, amountCents, requestId }); await load(); return result; }} onClaim={async requestId => { const result = await api.claim(selected.id, requestId); await load(); return result; }} />}
  </div>;
};
function EmptyState({ view, filtered, onExplore }: { view: View; filtered?: boolean; onExplore: () => void }) {
  return <div className="lp-empty"><span>{view === 'saved' ? <Bookmark size={28} /> : <Search size={28} />}</span><h3>{filtered ? 'No matching projects' : view === 'saved' ? 'Something catch your eye?' : 'Your next chapter starts here'}</h3><p>{filtered ? 'Try another name or choose a different status.' : view === 'saved' ? 'Tap the bookmark on a project to keep it here.' : 'Explore a pool to make your first allocation.'}</p><button className="lp-button lp-secondary" onClick={onExplore}>Explore pools <ArrowUpRight size={16} /></button></div>;
}
export default LaunchpadPage;
