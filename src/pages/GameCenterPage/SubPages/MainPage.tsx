import { initData, openTelegramLink, useSignal } from '@telegram-apps/sdk-react';
import { useState } from 'react';
import { useEffectOnActive } from 'keepalive-for-react';
import { ArrowUpRight, ChevronRight, MapPin, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FishingAvatar } from '@/components/Avatar/Avatar';
import { CountDown } from '@/components/CountDown/CountDown';
import { EmptyState, LoadingState, PageHeading } from '@/components/Design/Primitives';
import { CryptoTickerBanner, type Ticker } from '@/components/NeonUI/CryptoTickerBar';
import { type FishingPostData } from '@/constats';
import { MarketsApi, NolanDevApi, type TokenMarketInfo } from '@/utils/DashFunApi';
import iconBtc from '@/icons/icon-btc.svg';
import iconEth from '@/icons/icon-eth.svg';
import ProfileHeader from '../Components/ProfileHeader';

function DailyCheckinButton() {
  const token = useSignal(initData.raw);
  const [remaining, setRemaining] = useState(-1);
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  useEffectOnActive(() => {
    let active = true;
    const load = async () => {
      try { const value = await NolanDevApi.checkinRemaining(token as string); if (active) { setRemaining(value); setError(false); } }
      catch { if (active) setError(true); }
    };
    void load();
    const timer = window.setInterval(() => setRemaining(value => value > 0 ? value - 1 : value), 1000);
    return () => { active = false; clearInterval(timer); };
  }, [token]);
  if (remaining > 0) return <CountDown remaining={remaining} />;
  if (error) return <p className="nd-muted text-xs">Daily Alpha is temporarily unavailable.</p>;
  if (remaining < 0) return null;
  return <button className="nd-daily-card" onClick={() => navigate('/game-center/daily-checkin')}>
    <span className="nd-daily-icon"><Sparkles size={24} strokeWidth={1.5} /></span>
    <div><h2>Your daily alpha.</h2><p>Share a thought. Start a conversation.</p></div><ChevronRight size={18} />
  </button>;
}
export function GameCenter_MainPage() {
  const token = useSignal(initData.raw);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<FishingPostData[]>([]);
  const [markets, setMarkets] = useState<TokenMarketInfo[]>([]);
  const [postError, setPostError] = useState(false);
  const [marketError, setMarketError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffectOnActive(() => {
    let active = true;
    const loadPosts = async () => {
      setLoading(true); setPostError(false);
      try { const data = await NolanDevApi.getPosts(token as string); if (active) setPosts(data); }
      catch { if (active) setPostError(true); }
      finally { if (active) setLoading(false); }
    };
    const loadMarkets = async () => {
      try { const data = await MarketsApi.get(token as string, ['bitcoin', 'ethereum']); if (active) { setMarkets(data); setMarketError(false); } }
      catch { if (active) setMarketError(true); }
    };
    void loadPosts(); void loadMarkets();
    const timer = window.setInterval(loadMarkets, 10000);
    return () => { active = false; clearInterval(timer); };
  }, [token, retry]);
  const ticker = (symbol: string, iconUrl: string): Ticker => {
    const info = markets.find(item => item.symbol.toLowerCase() === symbol.toLowerCase());
    return { symbol, iconUrl, price: info?.current_price ?? 0, change24h: info?.price_change_percentage_24h ?? 0, volume24h: info?.total_volume ?? 0, brife: info?.brief?.replace('${price}', new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(info.current_price)) };
  };
  return <div id="GameCenter_MainPage" className="nd-page">
    <ProfileHeader />
    <PageHeading eyebrow="Overview" title="Your edge, every day." description="Market moves, fresh ideas, and what’s next." />
    <DailyCheckinButton />
    <CryptoTickerBanner left={ticker('BTC', iconBtc)} right={ticker('ETH', iconEth)} live={!marketError} />
    {marketError && <div className="nd-error" role="alert">Market data is unavailable.<button onClick={() => setRetry(value => value + 1)}>Retry</button></div>}
    <div className="nd-card nd-community"><div><h3>Better together.</h3><p>Join the Nolan community on Telegram.</p></div><button onClick={() => openTelegramLink('https://t.me/+YkV3fvCBvFxmMDVl')}>Join <ArrowUpRight size={16} /></button></div>
    <section><div className="nd-section-heading"><h2 className="nd-section-title">Community updates</h2><span>Latest thoughts</span></div>
      {loading ? <LoadingState>Loading updates…</LoadingState> : postError ? <div className="nd-error" role="alert">We couldn’t load updates.<button onClick={() => setRetry(value => value + 1)}>Retry</button></div> : posts.length === 0 ? <EmptyState title="A fresh start." description="Community updates will appear here. Share yours with Daily Alpha." /> : <div className="flex flex-col gap-3">{posts.map(post => <CommunityUpdate key={post.postId} post={post} />)}</div>}
    </section>
  </div>;
}
function CommunityUpdate({ post }: { post: FishingPostData }) {
  const minutes = Math.max(0, Math.floor((Date.now() - post.createdAt) / 60000));
  const time = minutes < 1 ? 'Just now' : minutes < 60 ? `${minutes}m ago` : minutes < 1440 ? `${Math.floor(minutes / 60)}h ago` : `${Math.floor(minutes / 1440)}d ago`;
  return <article className="nd-card nd-post"><div className="nd-post-top"><FishingAvatar size={36} userId={post.userId} displayName={post.posterName} /><div><strong>{post.posterName}</strong><small>{time}</small></div></div><p className="nd-post-content">{post.content}</p>{post.location && <div className="nd-post-location"><MapPin size={13} />{post.location}</div>}</article>;
}
