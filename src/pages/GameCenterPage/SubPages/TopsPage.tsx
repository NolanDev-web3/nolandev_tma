import { DFUserAvatar } from '@/components/Avatar/Avatar';
import { EmptyState, LoadingState, PageHeading } from '@/components/Design/Primitives';
import { LeaderBoardApi } from '@/utils/DashFunApi';
import { initData, useSignal } from '@telegram-apps/sdk-react';
import { useEffectOnActive } from 'keepalive-for-react';
import { Trophy } from 'lucide-react';
import { useState } from 'react';
import ProfileHeader from '../Components/ProfileHeader';
type TopListItem = { id: string; rank: number; score: number; username: string; display_name: string; avatar: string };
export function GameCenter_TopPage() {
  const token = useSignal(initData.raw);
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<TopListItem[]>([]);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffectOnActive(() => {
    let active = true;
    setLoading(true); setError(false);
    LeaderBoardApi.ndpTop(token as string).then(data => { if (active) setList(data); })
      .catch(() => { if (active) setError(true); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token, retry]);
  // The existing API appends the current user's row after the ranked list.
  const me = list.length > 0 ? list[list.length - 1] : null;
  const leaders = list.slice(0, -1);
  return <div id="GameCenter_TopPage" className="nd-page">
    <ProfileHeader />
    <PageHeading eyebrow="Leaderboard" title="Move up, together." description="The community making every point count." />
    {loading ? <LoadingState>Loading rankings…</LoadingState> : error ? <div className="nd-error" role="alert">Rankings are unavailable.<button onClick={() => setRetry(value => value + 1)}>Retry</button></div> : <>
      {me && <div className="nd-rank-summary"><Trophy size={28} strokeWidth={1.5} /><div><span>Your rank</span><strong>{me.rank > 0 ? `#${me.rank}` : 'Unranked'}</strong></div><div><span>Your points</span><strong>{me.score.toLocaleString('en-US')} <small className="text-xs">NP</small></strong></div></div>}
      <section><div className="nd-section-heading"><h2 className="nd-section-title">Community leaders</h2><span>Nolan points</span></div>
        {leaders.length === 0 ? <EmptyState title="The board is open" description="Community rankings will appear as members earn points." icon={<Trophy size={25} />} /> : <div className="nd-rank-list">{leaders.map(item => <div className={`nd-list-item ${item.id === me?.id ? 'nd-list-highlight' : ''}`} key={`${item.rank}-${item.id}`}>
          <span className={`nd-rank-position ${item.rank <= 3 ? 'is-top' : ''}`}>{String(item.rank).padStart(2, '0')}</span><DFUserAvatar size={34} userId={item.id} avatarPath={item.avatar} displayName={item.display_name} /><div className="nd-list-content"><p>{item.display_name || item.username}{item.id === me?.id ? ' · You' : ''}</p></div><strong className="nd-rank-score">{item.score.toLocaleString('en-US')}<small>NP</small></strong>
        </div>)}</div>}
      </section>
    </>}
  </div>;
}
