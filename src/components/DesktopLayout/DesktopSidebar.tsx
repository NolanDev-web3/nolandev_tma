import { FC, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { House, TrendingUpDown, Rocket, Trophy, Sparkles, ChevronRight, Clock } from 'lucide-react';
import { DFProfileAvatar } from '@/components/Avatar/Avatar';
import { useDashFunUser } from '@/components/DashFun/DashFunUser';
import { initData, useSignal } from '@telegram-apps/sdk-react';
import { NolanDevApi } from '@/utils/DashFunApi';

interface NavItem {
  id: string;
  path: string;
  title: string;
  icon: typeof House;
  badge?: string;
  isLive?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', path: '/game-center/main', title: 'Home', icon: House },
  { id: 'forecast', path: '/game-center/games', title: 'Forecast', icon: TrendingUpDown, isLive: true },
  { id: 'launchpad', path: '/game-center/launchpad', title: 'Launchpad', icon: Rocket },
  { id: 'tops', path: '/game-center/tops', title: 'Leaderboard', icon: Trophy },
];

export const DesktopSidebar: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useDashFunUser();
  const token = useSignal(initData.raw);
  const [remaining, setRemaining] = useState<number>(-1);

  // Fetch remaining countdown from backend (aligned with MainPage logic)
  useEffect(() => {
    let active = true;
    const fetchRemaining = async () => {
      try {
        const val = await NolanDevApi.checkinRemaining(token as string);
        if (active) {
          setRemaining(typeof val === 'number' ? val : 0);
        }
      } catch {
        if (active) {
          setRemaining(0);
        }
      }
    };

    void fetchRemaining();
    window.addEventListener('focus', fetchRemaining);
    return () => {
      active = false;
      window.removeEventListener('focus', fetchRemaining);
    };
  }, [token, location.pathname]);

  // 1-second countdown interval
  useEffect(() => {
    if (remaining <= 0) return;
    const timer = window.setInterval(() => {
      setRemaining(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [remaining > 0]);

  const formatCountdown = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
  };

  const isCoolingDown = remaining > 0;
  const isLoading = remaining < 0;

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#101c29]/95 border-r border-[#263445] shrink-0 sticky top-0 h-screen z-30 select-none">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#213b30] border border-[#365447] flex items-center justify-center font-bold text-[#bbf5d1] text-base shadow-sm">
          ▲
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold tracking-wider text-white text-base">NOLAN</span>
            <span className="text-[10px] font-bold text-[#bbf5d1] bg-[#1d332b] px-1.5 py-0.5 rounded">DEV</span>
          </div>
          <span className="text-[9px] font-semibold text-[#91a1b5] tracking-widest block">WEB3 GAMING HUB</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (!isActive) navigate(item.path);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all ${
                isActive
                  ? 'text-[#bbf5d1] bg-[#1b302b] border border-[#365447] font-semibold shadow-sm'
                  : 'text-[#91a1b5] hover:text-white hover:bg-[#142131] border border-transparent'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-[#bbf5d1]' : 'text-[#91a1b5]'} />
              <span className="text-sm">{item.title}</span>
              {item.isLive && (
                <span className="ml-auto text-[9px] px-2 py-0.5 rounded-full bg-[#1b2c3c] text-[#91a1b5] font-semibold">
                  LIVE
                </span>
              )}
              {item.badge && (
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-[#253c33] text-[#bbf5d1] font-bold">
                  {item.badge}
                </span>
              )}
              {isActive && !item.badge && !item.isLive && (
                <span className="ml-auto w-1.5 h-4 rounded-full bg-[#bbf5d1]"></span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Daily Check-In Shortcut Widget */}
      <div className="p-4 mx-3 mb-4 rounded-xl bg-gradient-to-br from-[#1d332b] to-[#142131] border border-[#395449]">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-base text-[#bbf5d1]"><Sparkles size={16} /></span>
          <span className="text-xs font-semibold text-white">Daily Alpha</span>
        </div>
        <p className="text-[11px] text-[#91a1b5] leading-relaxed mb-3">Check in daily to earn Nolan Points and allocation boosts.</p>
        
        {isCoolingDown ? (
          <button
            disabled
            className="w-full py-1.5 px-3 rounded-lg bg-[#142131] border border-[#26374a] text-[#7d90a4] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-not-allowed select-none transition"
            title="Next check-in countdown in progress"
          >
            <Clock size={13} className="text-[#7d90a4]" />
            <span>{formatCountdown(remaining)}</span>
          </button>
        ) : (
          <button
            onClick={() => navigate('/game-center/daily-checkin')}
            disabled={isLoading}
            className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition ${
              isLoading
                ? 'bg-[#152332] text-[#7d90a4] border border-[#233547] cursor-not-allowed opacity-60'
                : 'bg-[#bbf5d1] hover:bg-[#d1f9df] text-[#14281c] cursor-pointer'
            }`}
          >
            <span>Daily Check-In</span>
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* User Profile Footer */}
      <div
        onClick={() => navigate('/game-center/profile')}
        className="p-3 mx-3 mb-4 rounded-xl border border-[#263445] bg-[#142131]/80 hover:bg-[#1b2c3c] cursor-pointer flex items-center gap-3 transition"
      >
        <DFProfileAvatar size={36} />
        <div className="truncate flex-1 min-w-0">
          <div className="text-xs font-semibold text-white truncate">
            {user?.nickname || user?.displayName || 'Nolan Member'}
          </div>
          <div className="text-[10px] text-[#91a1b5] truncate">
            UID: {user?.channelId || user?.id || '—'}
          </div>
        </div>
        <ChevronRight size={16} className="text-[#91a1b5]" />
      </div>
    </aside>
  );
};
export default DesktopSidebar;
