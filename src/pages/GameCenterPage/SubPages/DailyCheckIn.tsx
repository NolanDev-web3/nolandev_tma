import AddLocation from '@/components/AddLocation/AddLocation';
import { useDashFunUser } from '@/components/DashFun/DashFunUser';
import { BackLink, PageHeading } from '@/components/Design/Primitives';
import { NeonButton } from '@/components/NeonUI/NeonUI';
import { NolanDevApi } from '@/utils/DashFunApi';
import { initData, useSignal } from '@telegram-apps/sdk-react';
import { ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
export function FishingVerse_DailyCheckIn() {
  const user = useDashFunUser();
  const token = useSignal(initData.raw);
  const navigate = useNavigate();
  const [post, setPost] = useState('');
  const [location, setLocation] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const sendPost = async () => {
    if (!post.trim() || posting) return;
    setPosting(true); setError('');
    try { await NolanDevApi.post(token as string, post, location, ''); setPost(''); setLocation(''); navigate('/game-center/main'); }
    catch { setError('Your post couldn’t be shared. Please try again.'); }
    finally { setPosting(false); }
  };
  return <div id="GameCenter_DailyCheckIn" className="nd-page">
    <BackLink /><PageHeading eyebrow="Daily Alpha" title="What’s on your radar?" description="A market thought, a fresh idea, or something worth sharing." />
    <div className="nd-card nd-card-pad"><span className="nd-eyebrow">POSTING AS</span><p className="text-sm mt-2">{user?.nickname || user?.displayName}</p></div>
    <div><label htmlFor="daily-alpha-post" className="nd-field-label">Your daily alpha</label><textarea id="daily-alpha-post" className="nd-textarea" placeholder="Share your perspective…" value={post} disabled={posting} onChange={event => setPost(event.target.value)} /></div>
    <div className="nd-composer-bottom"><AddLocation onLocationChanged={setLocation} /><NeonButton disabled={!post.trim() || posting} loading={posting} onClick={() => void sendPost()} rightIcon={<ArrowUpRight size={16} />}>Share alpha</NeonButton></div>
    {error && <p className="nd-error" role="alert">{error}</p>}
  </div>;
}
