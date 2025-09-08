// import {
//   bindMiniAppCSSVars,
//   bindThemeParamsCSSVars,
//   bindViewportCSSVars,
//   initNavigator,
//   useLaunchParams,
//   useMiniApp,
//   useThemeParams,
//   useViewport,
//   useSwipeBehavior,
// } from "@telegram-apps/sdk-react";
import { AppRoot } from "@telegram-apps/telegram-ui";
import { useEffect, type FC } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";

import { AppRoute, routes } from "@/navigation/routes.tsx";
import { miniApp, postEvent, useLaunchParams } from "@telegram-apps/sdk-react";
import { CoinProvider } from "./DashFun/DashFunCoins";
import { SpinWheelProvider } from "./DashFun/DashFunSpinWheel";
import { UserProvider } from "./DashFun/DashFunUser";
import { LanguageProvider } from "./Language/Language";
import { Page } from "./Page";
import FirebaseLoader from "./FirebaseLoader/FirebaseLoader";

const setupRoute = (route: AppRoute, wrapPage: boolean = true) => {
  let P = () => wrapPage ? <Page back={route.back} allowYScroll={route.allowYScroll}><route.Component /></Page>
    : <route.Component />;

  const subRoutes: React.JSX.Element[] = [];

  if (route.subRoutes != null && route.subRoutes.length > 0) {
    route.subRoutes.forEach(r => {
      subRoutes.push(setupRoute(r, false));
    })
  }

  const r = <Route key={route.path} path={route.path} Component={P} >
    {subRoutes}
  </Route>;

  return r;
}

export const App: FC = () => {
  const lp = useLaunchParams();
  const routesArr = []

  useEffect(() => {
    postEvent("web_app_request_theme");
  }, [])

  for (let index = 0; index < routes.length; index++) {
    const route = routes[index];

    // let P = () => <Page back={route.back} allowYScroll={route.allowYScroll}><route.Component /></Page>;
    // const r = <Route key={route.path} path={route.path} Component={P} />
    const r = setupRoute(route);
    routesArr.push(r);
  }

  return (
    <AppRoot
      id="appRoot"
      appearance={miniApp.isDark() ? "dark" : "light"}
      platform={["macos", "ios"].includes(lp.platform) ? "ios" : "base"}
      className="w-full h-full"
    >
      {/* <TalkingDataLoader /> */}
      <FirebaseLoader />
      <BrowserRouter >
        <LanguageProvider>
          <UserProvider>
            <CoinProvider>
              <SpinWheelProvider>
                <RouterListener />
                <Routes>
                  {routesArr}
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
                {/* <RouterProvider router={appRoutes} /> */}
              </SpinWheelProvider>
            </CoinProvider>
          </UserProvider>
        </LanguageProvider>
      </BrowserRouter>
    </AppRoot>
  );
};

const RouterListener = () => {
  const location = useLocation();
  useEffect(() => {
    // const { aplus_queue } = window;
    // if (aplus_queue) {
    //   aplus_queue.push({
    //     action: 'aplus.sendPV',
    //     arguments: [{ is_auto: false }] // 此处上报的数据暂时在后台没有展示
    //   });
    // }
  }, [location])
  return null;
}