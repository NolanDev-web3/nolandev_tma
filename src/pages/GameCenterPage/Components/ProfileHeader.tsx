import { DFProfileAvatar } from '@/components/Avatar/Avatar';
import { useDashFunCoins } from '@/components/DashFun/DashFunCoins';
import { useDashFunUser } from '@/components/DashFun/DashFunUser';
import { useNavigate } from 'react-router-dom';
import npIcon from '@/icons/np-icon.png';

export default function ProfileHeader({ disableClick = false }: { disableClick?: boolean }) {
  const navigate = useNavigate();
  const user = useDashFunUser();
  const [, , , getCoinInfo] = useDashFunCoins();
  const points = getCoinInfo('NolanDevPoint', 'name');
  const identity = <><DFProfileAvatar size={42} /><div className="nd-profile-name"><span>WELCOME BACK</span><strong>{user?.nickname || user?.displayName || 'Nolan member'}</strong></div></>;
  return <div className="nd-profile-header md:hidden">
    {disableClick ? <div className="nd-profile-link">{identity}</div> : <button className="nd-profile-link" onClick={() => navigate('/game-center/profile')} aria-label="Open your profile">{identity}</button>}
    <span className="nd-points inline-flex items-center gap-1.5" aria-label={`${points?.userData?.amount ?? 0} Nolan points`}>
      <img src={npIcon} alt="NP" className="w-3.5 h-3.5 rounded-full object-contain shrink-0" />
      <span>{points?.userData ? points.userData.amount.toLocaleString('en-US') : '—'}</span>
      <small>NP</small>
    </span>
  </div>;
}
