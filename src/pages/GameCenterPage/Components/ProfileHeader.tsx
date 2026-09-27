import { DFProfileAvatar } from '@/components/Avatar/Avatar';
import { useDashFunCoins } from '@/components/DashFun/DashFunCoins';
import { useDashFunUser } from '@/components/DashFun/DashFunUser';
import { useNavigate } from 'react-router-dom';

export default function ProfileHeader({ disableClick = false }: { disableClick?: boolean }) {
  const navigate = useNavigate();
  const user = useDashFunUser();
  const [, , , getCoinInfo] = useDashFunCoins();
  const points = getCoinInfo('NolanDevPoint', 'name');
  const identity = <><DFProfileAvatar size={42} /><div className="nd-profile-name"><span>WELCOME BACK</span><strong>{user?.nickname || user?.displayName || 'Nolan member'}</strong></div></>;
  return <div className="nd-profile-header md:hidden">
    {disableClick ? <div className="nd-profile-link">{identity}</div> : <button className="nd-profile-link" onClick={() => navigate('/game-center/profile')} aria-label="Open your profile">{identity}</button>}
    <span className="nd-points" aria-label={`${points?.userData?.amount ?? 0} Nolan points`}>{points?.userData ? points.userData.amount.toLocaleString('en-US') : '—'}<small>NP</small></span>
  </div>;
}
