import { useEffect, type ComponentType, type JSX } from "react";

import { Page } from "@/components/Page";
import { GameCenterPage } from "@/pages/GameCenterPage/GameCenterPage";
import { GameCenter_GamesPage } from "@/pages/GameCenterPage/SubPages/GamesPage";
import { GameCenter_MainPage } from "@/pages/GameCenterPage/SubPages/MainPage";
import { GameCenter_Profile } from "@/pages/GameCenterPage/SubPages/ProfilePage";
import { GameCenter_TaskPage } from "@/pages/GameCenterPage/SubPages/TaskPage";
// import { IntroPage } from "@/pages/IntroPage/IntroPage";
import EntryPage from "@/pages/Entry/EntryPage";
import { FishingVerse_DailyCheckIn } from "@/pages/GameCenterPage/SubPages/DailyCheckIn";
import { GameCenter_TopPage } from "@/pages/GameCenterPage/SubPages/TopsPage";
import LaunchpadPage from "@/pages/Launchpad/LaunchpadPage";
import { Bitcoin, Gift, TrendingUpDown, Trophy, Rocket } from "lucide-react";
import { createHashRouter, RouteObject, useNavigate } from "react-router-dom";

export interface AppRoute {
  id: string;
  path: string;
  Component: ComponentType;
  title?: string;
  icon?: JSX.Element;
  allowYScroll?: boolean;
  back?: "close" | "back" | "nop" | string; //back按钮的处理， close 表示 显示close按钮，back表示退到前一个页面，nop表示不作处理，留给页面自己处理，string表示退到指定页面
  subRoutes?: AppRoute[]
}


const setupRoute = (route: AppRoute, wrapPage: boolean = true): RouteObject => {
  const p = wrapPage ? <Page back={route.back} allowYScroll={route.allowYScroll}><route.Component /></Page>
    : <route.Component />;

  const subRoutes: RouteObject[] = [];

  if (route.subRoutes != null && route.subRoutes.length > 0) {
    route.subRoutes.forEach(r => {
      subRoutes.push(setupRoute(r, false));
    })
  }

  const r: RouteObject = {
    path: route.path,
    element: p,
    children: subRoutes,
  }

  return r;
}

const RootComponent = () => {
  const nav = useNavigate();
  useEffect(() => {
    nav("/game-center")
  }, [])
  return <></>
}

export const routes: AppRoute[] = [
  { id: "root", path: "/", Component: RootComponent, allowYScroll: true, back: "close" },
  { id: "entry", path: "/entry/:channel/:to", Component: EntryPage, allowYScroll: true, back: "close" },

  {
    id: "gamecenter", path: "/game-center", Component: GameCenterPage, allowYScroll: false, back: "nop",
    subRoutes: [
      { id: "gamecenter-main", path: "main", Component: GameCenter_MainPage, allowYScroll: true, back: "close", title: "Main", icon: < Bitcoin absoluteStrokeWidth size={28} /> },
      { id: "gamecenter-games", path: "games", Component: GameCenter_GamesPage, allowYScroll: true, back: "/game-center/main", title: "Forecast", icon: <TrendingUpDown absoluteStrokeWidth size={28} /> },
      { id: "gamecenter-tasks", path: "tasks", Component: GameCenter_TaskPage, allowYScroll: true, back: "/game-center/main", title: "Tasks", icon: <Gift absoluteStrokeWidth size={28} /> },
      { id: "gamecenter-tops", path: "tops", Component: GameCenter_TopPage, allowYScroll: true, back: "/game-center/main", title: "Top", icon: <Trophy absoluteStrokeWidth size={28} /> },
      { id: "gamecenter-launchpad", path: "launchpad", Component: LaunchpadPage, allowYScroll: true, back: "/game-center/main", title: "Launchpad", icon: <Rocket absoluteStrokeWidth size={28} /> },
      { id: "gamecenter-profile", path: "profile", Component: GameCenter_Profile, allowYScroll: true, back: "/game-center/main" },
      { id: "fishing-verse-daily-checkin", path: "daily-checkin", Component: FishingVerse_DailyCheckIn, allowYScroll: true, back: "/game-center/main" }
    ]
  },

  // { path: "/game-center/main", Component: GameCenter_MainPage, allowYScroll: true, back: "close", title: "Main", icon: <Gamepad2 absoluteStrokeWidth /> },
  // { path: "/game-center/tasks", Component: GameCenter_TaskPage, allowYScroll: true, back: "/game-center", title: "Tasks", icon: <Gift absoluteStrokeWidth /> },
  // { path: "/game-center/friends", Component: GameCenter_FriendsPage, allowYScroll: true, back: "/game-center", title: "Friends", icon: <Trophy absoluteStrokeWidth /> },
  // { path: "/game-center/search", Component: GameCenter_SearchPage, allowYScroll: true, back: "/game-center" },

  // { path: "/game-genre", Component: GameAllList },
  // { path: "/game-details/:id", Component: GameDetails },
  // { path: "/profile", Component: ProfilePage },
];

const rs = routes.map(r => setupRoute(r));
console.log("routes", rs);

export const appRoutes = createHashRouter(rs);