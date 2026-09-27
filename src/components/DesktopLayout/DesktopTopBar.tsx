import { FC } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DFProfileAvatar } from '@/components/Avatar/Avatar';
import { useDashFunCoins } from '@/components/DashFun/DashFunCoins';
import { useDashFunUser } from '@/components/DashFun/DashFunUser';
import { Sparkles, Wallet } from 'lucide-react';

const BREADCRUMB_MAP: Record<string, { section: string; title: string }> = {
  '/game-center/main': { section: 'Nolan', title: 'Home Overview' },
  '/game-center/games': { section: 'Nolan', title: 'Market Forecast' },
  '/game-center/launchpad': { section: 'Nolan', title: 'Launchpad Pools' },
  '/game-center/tasks': { section: 'Nolan', title: 'Community Tasks' },
  '/game-center/tops': { section: 'Nolan', title: 'Leaderboard Rankings' },
  '/game-center/profile': { section: 'Nolan', title: 'User Profile' },
  '/game-center/daily-checkin': { section: 'Nolan', title: 'Daily Check-In' },
};

export const DesktopTopBar: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useDashFunUser();
  const [, , , getCoinInfo] = useDashFunCoins();
  const points = getCoinInfo('NolanDevPoint', 'name');

  const currentInfo = BREADCRUMB_MAP[location.pathname] || { section: 'Nolan', title: 'Game Center' };

  return (
    <header className="hidden md:flex h-16 border-b border-[#263445] bg-[#0c1521]/90 backdrop-blur-md px-8 items-center justify-between sticky top-0 z-20 shrink-0 select-none">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-[#91a1b5]">{currentInfo.section}</span>
        <span className="text-[#526477]">/</span>
        <span className="text-white font-medium">{currentInfo.title}</span>
      </div>

      {/* Top Right Controls: NP Points + Available Balance + User */}
      <div className="flex items-center gap-3">
        {/* Nolan Points (NP) Badge */}
        <button
          onClick={() => navigate('/game-center/profile')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1b302b] hover:bg-[#233f38] border border-[#365447] transition group"
          title="Nolan Points"
        >
          <span className="w-5 h-5 rounded-lg bg-[#2c4438] text-[#bbf5d1] flex items-center justify-center text-[10px] font-bold">
            <Sparkles size={12} />
          </span>
          <div className="text-left">
            <span className="text-[9px] uppercase tracking-wider text-[#91a1b5] group-hover:text-white transition block leading-none">
              Nolan Points
            </span>
            <span className="text-xs font-bold text-[#bbf5d1] font-mono leading-tight">
              {points?.userData ? points.userData.amount.toLocaleString('en-US') : '0'} <small className="text-[#9dc9af]">NP</small>
            </span>
          </div>
        </button>

        {/* Available Balance (USDT) */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#172a26] border border-[#365047]">
          <span className="w-5 h-5 rounded-lg bg-[#203a31] text-[#bbf5d1] flex items-center justify-center text-[11px]">
            <Wallet size={12} />
          </span>
          <div className="text-left">
            <span className="text-[9px] uppercase tracking-wider text-[#91a1b5] block leading-none">
              Available Balance
            </span>
            <span className="text-xs font-bold text-[#bbf5d1] font-mono leading-tight">
              1,000.00 <small className="text-[#9dc9af]">USDT</small>
            </span>
          </div>
        </div>

        {/* User Profile Quick Link */}
        <button
          onClick={() => navigate('/game-center/profile')}
          className="flex items-center gap-2.5 pl-2 pr-3 py-1 rounded-xl bg-[#1b2c3c] hover:bg-[#23384c] border border-[#354657] transition"
        >
          <DFProfileAvatar size={28} />
          <span className="text-xs font-medium text-white max-w-[120px] truncate">
            {user?.nickname || user?.displayName || 'Profile'}
          </span>
        </button>
      </div>
    </header>
  );
};
export default DesktopTopBar;
