import useDashFunSafeArea from '@/components/DashFun/DashFunSafeArea';
import { routes, type AppRoute } from '@/navigation/routes';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const GameCenterTab = forwardRef<GameCenterTabRef>(function GameCenterTab(_, ref) {
  const element = useRef<HTMLElement>(null);
  const { safeArea } = useDashFunSafeArea();
  const navigate = useNavigate();
  const location = useLocation();
  const children = routes.find(route => route.id === 'gamecenter')?.subRoutes ?? [];
  const tabs = ['gamecenter-main', 'gamecenter-games', 'gamecenter-launchpad', 'gamecenter-tops']
    .map(id => children.find(route => route.id === id)).filter((route): route is AppRoute => route !== undefined);
  useImperativeHandle(ref, () => ({ getHeight: () => element.current?.offsetHeight ?? 0 }));
  return <nav id="bottomNavigation" ref={element} className="nd-nav md:hidden" aria-label="Main navigation" style={{ paddingBottom: Math.max(safeArea.bottom, 0) }}>
    {tabs.map(route => {
      const path = `/game-center/${route.path}`;
      const selected = location.pathname === path;
      return <button key={route.id} onClick={() => { if (!selected) navigate(path); }} aria-current={selected ? 'page' : undefined}>
        {route.icon}<span>{route.title}</span>
      </button>;
    })}
  </nav>;
});
export interface GameCenterTabRef { getHeight: () => number }
