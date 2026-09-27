import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initData, useSignal } from '@telegram-apps/sdk-react';
import { ChevronRight, LogOut, Trash2 } from 'lucide-react';
import { DFButton } from '@/components/controls';
import { useDashFunUser } from '@/components/DashFun/DashFunUser';
import { BackLink, FormInput, PageHeading } from '@/components/Design/Primitives';
import { Sheet } from '@/components/Design/Sheet';
import { UserProfileUpdatedEvent } from '@/components/Event/Events';
import { dataURLtoBlob } from '@/components/Utils/File';
import { makeBrowserEnv } from '@/mockEnv';
import { AccApi, AccountType, type DashFunAccount, FishingVerseApi, getAvatarUrl, getEnv } from '@/utils/DashFunApi';
import { isInTelegram } from '@/utils/Utils';
import AvatarUpload from '../Components/AvatarUploader';

export function GameCenter_Profile() {
  const navigate = useNavigate();
  const user = useDashFunUser();
  const token = useSignal(initData.raw);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [error, setError] = useState('');
  const signOut = useCallback(() => {
    localStorage.removeItem('DashFun-Token-' + getEnv());
    setLoading(true);
    makeBrowserEnv('', '', '', AccountType.Email, '', ''); initData.restore();
    setTimeout(() => { setLoading(false); navigate('/game-center'); window.location.reload(); }, 1000);
  }, [navigate]);
  const saveAvatar = async () => {
    if (!avatar || uploading) return;
    setUploading(true); setError('');
    try {
      const profile = await FishingVerseApi.updateProfile(token as string, { userId: '', nickname: '', avatar }, dataURLtoBlob(avatar));
      UserProfileUpdatedEvent.fire(profile); setAvatar(null); window.location.reload();
    } catch { setError('Your photo couldn’t be updated. Please try again.'); }
    finally { setUploading(false); }
  };
  const deleteAccount = async () => {
    if (confirmation.toUpperCase() !== 'DELETE' || loading) return;
    setLoading(true); setError('');
    try {
      const saved = localStorage.getItem('DashFun-Token-' + getEnv());
      if (!saved) throw new Error('Please sign in again before deleting your account.');
      const account = JSON.parse(atob(saved)) as DashFunAccount;
      await AccApi.deleteAccount(account.account_id, account.token, account.type);
      signOut();
    } catch (err) { setError(err instanceof Error ? err.message : 'Your account couldn’t be deleted. Please try again.'); setLoading(false); }
  };
  const photoUrl = user?.avatarUrl ? getAvatarUrl(user.id, user.avatarUrl) : '';
  return <div id="GameCenter_Profile" className="nd-page">
    <BackLink /><PageHeading eyebrow="Profile" title="Make it yours." description="Your identity in the Nolan community." />
    <section className="nd-card"><div className="nd-profile-photo"><AvatarUpload size={88} defaultAvatarUrl={photoUrl} onAvatarSelected={setAvatar} /><div className="text-center"><strong>{user?.nickname || user?.displayName}</strong><p className="mt-1">Tap your photo to make a change</p></div>{avatar && <DFButton loading={uploading} onClick={() => void saveAvatar()}>Save photo</DFButton>}</div>
      <dl className="nd-profile-details"><div><dt>Display name</dt><dd>{user?.nickname || user?.displayName || '—'}</dd></div><div><dt>Username</dt><dd>{user?.userName || '—'}</dd></div><div><dt>Account</dt><dd>{isInTelegram() ? 'Telegram' : 'Nolan account'}</dd></div></dl>
    </section>
    {!isInTelegram() && <><div className="nd-card"><button className="nd-settings-row" disabled={loading} onClick={signOut}><LogOut size={17} />{loading ? 'Signing out…' : 'Sign out'}<ChevronRight size={16} /></button></div><section className="nd-danger-zone"><h2 className="nd-section-title">Account management</h2><p>Permanently remove your account and its associated data.</p><DFButton mode="danger" disabled={loading} onClick={() => { setShowDelete(true); setError(''); }}><Trash2 size={15} />Delete account</DFButton></section></>}
    {error && !showDelete && <p className="nd-error" role="alert">{error}</p>}
    {showDelete && <Sheet title="Delete your account?" busy={loading} onClose={() => { setShowDelete(false); setConfirmation(''); setError(''); }}><div className="flex flex-col gap-5"><p className="nd-muted text-sm leading-6">This permanently deletes your account and all associated data. This action cannot be undone.</p><p className="text-sm">Type <strong className="text-[var(--nd-danger)]">DELETE</strong> to confirm.</p><FormInput placeholder="DELETE" autoComplete="off" value={confirmation} onChange={event => setConfirmation(event.target.value)} />{error && <p className="nd-error" role="alert">{error}</p>}<DFButton mode="danger" className="w-full" loading={loading} disabled={confirmation.toUpperCase() !== 'DELETE'} onClick={() => void deleteAccount()}>Permanently delete account</DFButton><DFButton mode="plain" disabled={loading} onClick={() => { setShowDelete(false); setConfirmation(''); setError(''); }}>Keep my account</DFButton></div></Sheet>}
  </div>;
}
