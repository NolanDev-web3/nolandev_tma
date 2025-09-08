import { useEffect, type ComponentType, type JSX } from "react";

import { Page } from "@/components/Page";
import { GameCenterPage } from "@/pages/GameCenterPage/GameCenterPage";
import { GameCenter_FriendsPage } from "@/pages/GameCenterPage/SubPages/FriendsPage";
import { GameCenter_GamesPage } from "@/pages/GameCenterPage/SubPages/GamesPage";
import { GameCenter_MainPage } from "@/pages/GameCenterPage/SubPages/MainPage";
import { GameCenter_Profile } from "@/pages/GameCenterPage/SubPages/ProfilePage";
import { GameCenter_SearchPage } from "@/pages/GameCenterPage/SubPages/SearchGamePage";
import { GameCenter_TaskPage } from "@/pages/GameCenterPage/SubPages/TaskPage";
import { GameWrapper } from "@/pages/GamePage/GameWrapper";
import { InitDataPage } from "@/pages/InitDataPage/InitDataPage";
// import { IntroPage } from "@/pages/IntroPage/IntroPage";
import { GameProvider } from "@/components/DashFun/DashFunGame";
import EntryPage from "@/pages/Entry/EntryPage";
import { FishingVerse_DailyCheckIn } from "@/pages/GameCenterPage/SubPages/DailyCheckIn";
import GameCenter_RechargePage from "@/pages/GameCenterPage/SubPages/RechargePage";
import { GameCenter_SpinWheelPage } from "@/pages/GameCenterPage/SubPages/SpinWheelPage";
import { GameCenter_TopPage } from "@/pages/GameCenterPage/SubPages/TopsPage";
import { GameCenter_WalletPage } from "@/pages/GameCenterPage/SubPages/WalletPage";
import { LaunchParamsPage } from "@/pages/LaunchParamsPage/LaunchParamsPage.tsx";
import MainPage from "@/pages/MainPage/MainPage";
import { TestingPage } from "@/pages/TestingPage/TestingPage";
import { ThemeParamsPage } from "@/pages/ThemeParamsPage/ThemeParamsPage.tsx";
import { TONConnectPage } from "@/pages/TONConnectPage/TONConnectPage";
import { Fish, Gift, ShoppingCart, Trophy, Users, Wallet2 } from "lucide-react";
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
  { id: "testing", path: "/testing", Component: TestingPage, allowYScroll: true, back: "close" },
  { id: "game", path: "/game", Component: () => <GameProvider><GameWrapper /></GameProvider>, back: "close", allowYScroll: false },
  { id: "", path: "/init-data", Component: InitDataPage, title: "Init Data" },
  { id: "", path: "/theme-params", Component: ThemeParamsPage, title: "Theme Params" },
  { id: "", path: "/launch-params", Component: LaunchParamsPage, title: "Launch Params", },
  { id: "", path: "/game-center-old", Component: MainPage, allowYScroll: true, back: "close" },
  { id: "entry", path: "/entry/:channel/:to", Component: EntryPage, allowYScroll: true, back: "close" },

  {
    id: "gamecenter", path: "/game-center", Component: GameCenterPage, allowYScroll: false, back: "nop",
    subRoutes: [
      { id: "gamecenter-main", path: "main", Component: GameCenter_MainPage, allowYScroll: true, back: "close", title: "Fishing", icon: <Fish absoluteStrokeWidth size={28} /> },
      { id: "gamecenter-games", path: "games", Component: GameCenter_GamesPage, allowYScroll: true, back: "/game-center/main", title: "NFT Shop", icon: <ShoppingCart absoluteStrokeWidth size={28} /> },
      { id: "gamecenter-tasks", path: "tasks", Component: GameCenter_TaskPage, allowYScroll: true, back: "/game-center/main", title: "Tasks", icon: <Gift absoluteStrokeWidth size={28} /> },
      { id: "gamecenter-friends", path: "friends", Component: GameCenter_FriendsPage, allowYScroll: true, back: "/game-center/main", title: "Friends", icon: <Users absoluteStrokeWidth size={28} /> },
      { id: "gamecenter-wallet", path: "wallet", Component: GameCenter_WalletPage, allowYScroll: true, back: "/game-center/main", title: "Wallet", icon: <Wallet2 absoluteStrokeWidth size={28} /> },
      { id: "gamecenter-tops", path: "tops", Component: GameCenter_TopPage, allowYScroll: true, back: "/game-center/main", title: "Top", icon: <Trophy absoluteStrokeWidth size={28} /> },
      { id: "gamecenter-search", path: "search", Component: GameCenter_SearchPage, allowYScroll: true, back: "/game-center/games" },
      { id: "gamecenter-profile", path: "profile", Component: GameCenter_Profile, allowYScroll: true, back: "/game-center/main" },
      { id: "gamecenter-recharge", path: "recharge", Component: GameCenter_RechargePage, allowYScroll: true, back: "" },
      { id: "gamecenter-spin", path: "spin", Component: GameCenter_SpinWheelPage, allowYScroll: true, back: "/game-center/tasks" },
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
  {
    id: "",
    path: "/ton-connect",
    Component: TONConnectPage,
    title: "TON Connect",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        viewBox="0 0 56 56"
        fill="none"
      >
        <path
          d="M28 56C43.464 56 56 43.464 56 28C56 12.536 43.464 0 28 0C12.536 0 0 12.536 0 28C0 43.464 12.536 56 28 56Z"
          fill="#0098EA"
        />
        <path
          d="M37.5603 15.6277H18.4386C14.9228 15.6277 12.6944 19.4202 14.4632 22.4861L26.2644 42.9409C27.0345 44.2765 28.9644 44.2765 29.7345 42.9409L41.5381 22.4861C43.3045 19.4251 41.0761 15.6277 37.5627 15.6277H37.5603ZM26.2548 36.8068L23.6847 31.8327L17.4833 20.7414C17.0742 20.0315 17.5795 19.1218 18.4362 19.1218H26.2524V36.8092L26.2548 36.8068ZM38.5108 20.739L32.3118 31.8351L29.7417 36.8068V19.1194H37.5579C38.4146 19.1194 38.9199 20.0291 38.5108 20.739Z"
          fill="white"
        />
      </svg>
    ),
  },
];

const rs = routes.map(r => setupRoute(r));
console.log("routes", rs);

export const appRoutes = createHashRouter(rs);