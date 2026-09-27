import useDashFunSafeArea from "@/components/DashFun/DashFunSafeArea";
import { AppRoute, routes } from "@/navigation/routes";
import { backButton } from "@telegram-apps/sdk-react";
import KeepAlive, { useKeepAliveRef } from "keepalive-for-react";
import { FC, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useOutlet } from "react-router-dom";
import { ContentWrapper } from "../ContentWrapper";
import { GameCenterTab, GameCenterTabRef } from "./Components/GameCenterTab";
import { DesktopSidebar } from "@/components/DesktopLayout/DesktopSidebar";
import { DesktopTopBar } from "@/components/DesktopLayout/DesktopTopBar";
import "./GameCenterPage.css";


// const pageHideTabBar = [
// 	"/game-center/search",
// 	"/game-center/profile"
// ]
type PageSetting = {
	hideTabBar?: boolean;
	doNotKeepAlive?: boolean;
	doNotScrollPage?: boolean;
}
type PageSettings = {
	[key: string]: PageSetting;
};

const pageSetting: PageSettings = {
	"/game-center/search": {
		hideTabBar: true,
		// /game-center/search需要特殊处理，如果放在keepalive里面，会导致input的autoFocus失效
		doNotKeepAlive: true,
	},
	"/game-center/spin": {
		hideTabBar: true,
	},
	"/game-center/profile": {
		hideTabBar: true,
	},
	"/game-center/friends": {
		doNotScrollPage: true,
	},
	"/game-center/tops": {},
	"/game-center/recharge": {
		hideTabBar: true,
	},
	"/game-center/daily-checkin": {
		hideTabBar: true,
	}
}

const keepPageAlive = (pathname: string) => {
	const setting = pageSetting[pathname];
	console.log("keepPageAlive", pathname, setting);
	if (setting == null) {
		return true;
	}
	return setting.doNotKeepAlive != true;
}

const showTabBar = (pathname: string) => {
	const setting = pageSetting[pathname];
	if (setting == null) {
		return true;
	}
	return setting.hideTabBar != true;
}

const scrolPage = (pathname: string) => {
	const setting = pageSetting[pathname];
	console.log("scrolPage", pathname, setting);
	if (setting == null) {
		return true;
	}
	return setting.doNotScrollPage != true;
}


const customPageBg: { [key: string]: string } = {
	"/game-center/main": ""
}

export const GameCenterPage: FC = () => {
	const aliveRef = useKeepAliveRef();
	const tabRef = useRef<GameCenterTabRef>(null);
	const [tabOffset, setTabOffset] = useState(0);
	const location = useLocation();
	const navigate = useNavigate();
	const { safeArea } = useDashFunSafeArea();
	let outlet = useOutlet();

	const hideTabBar = !showTabBar(location.pathname);
	const keepalive = keepPageAlive(location.pathname);
	const scroll = scrolPage(location.pathname);

	outlet = <ContentWrapper
		paddingBottomAdd={hideTabBar ? 0 : tabOffset}
		className={hideTabBar || !scroll ? "h-full" : ""}>
		{outlet}
	</ContentWrapper>

	const currentCacheKey = useMemo(() => {
		return location.pathname + location.search;
	}, [location.pathname, location.search]);

	useEffect(() => {
		const h = tabRef.current?.getHeight() || 0;
		setTabOffset(h - safeArea.bottom);
	}, [hideTabBar, safeArea.bottom])

	useEffect(() => {
		if (location.pathname == "/game-center/" || location.pathname == "/game-center") {
			navigate("/game-center/main");
			return
		}

		const gamecenter = routes.find(r => r.id == "gamecenter") as AppRoute;
		const currentRoute: AppRoute = gamecenter.subRoutes?.find(r => `${gamecenter.path}/${r.path}` == location.pathname) as AppRoute;

		if (currentRoute != null) {
			if (currentRoute.back == "close" || currentRoute.back == "nop") {
				backButton.hide();
			} else {
				backButton.show();
				return backButton.onClick(() => {
					// Allow an open sheet to consume Telegram back before changing routes.
					if (!window.dispatchEvent(new Event("nolandev:back", { cancelable: true }))) return;
					if (currentRoute.back == null || currentRoute.back == "back") {
						navigate(-1);
					} else {
						navigate(currentRoute.back as string);
					}
				});
			}
		}
	}, [location.pathname])

	return (
		<div className="w-full h-full flex flex-row overflow-hidden bg-[#0c1521]">
			{/* Desktop Left Sidebar (Only visible on md+) */}
			<DesktopSidebar />

			{/* Main Column */}
			<div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
				{/* Desktop Top Header (Only visible on md+) */}
				<DesktopTopBar />

				{/* Page Container */}
				<div id="GameCenterPage" className={"nd-shell flex-1 w-full h-full flex flex-col overflow-hidden " + (customPageBg[location.pathname] || "")}>
					<div className="w-full h-full max-w-screen-sm md:max-w-7xl mx-auto flex flex-col flex-1 overflow-hidden">
						{
							!keepalive && outlet
						}
						<KeepAlive transition={false} aliveRef={aliveRef} activeCacheKey={currentCacheKey} max={18}>
							{keepalive && !scroll && outlet}
							<MemoScrollTopWrapper>
								{keepalive && scroll && outlet}
							</MemoScrollTopWrapper>
						</KeepAlive>
					</div>
					{(!hideTabBar && <GameCenterTab ref={tabRef} />)}
				</div>
			</div>
		</div>
	);
}


// remember the scroll position of the page when switching routes
function MemoScrollTopWrapper(props: { children?: ReactNode }) {
	const { children } = props;
	const domRef = useRef<HTMLDivElement>(null);
	const location = useLocation();
	const scrollHistoryMap = useRef<Map<string, number>>(new Map());

	const activeKey = useMemo(() => {
		return location.pathname + location.search;
	}, [location.pathname, location.search]);

	useEffect(() => {
		const divDom = domRef.current;
		if (!divDom) return;
		setTimeout(() => {
			const scrollTo = scrollHistoryMap.current.get(activeKey) || 0;
			if (scrollTo != 0) {
				divDom.scrollTo(0, scrollHistoryMap.current.get(activeKey) || 0);
			}
		}, 0); // 300 milliseconds to wait for the animation transition ending
		const onScroll = (e: Event) => {
			const target = e.target as HTMLDivElement;
			if (!target) return;
			scrollHistoryMap.current.set(activeKey, target?.scrollTop || 0);
		};
		divDom?.addEventListener('scroll', onScroll, {
			passive: true,
		});
		return () => {
			divDom?.removeEventListener('scroll', onScroll);
		};
	}, [activeKey]);

	return (
		<div
			id="memo-scroll-top-warpper"
			className=" w-full h-full overflow-y-auto hide-scrollbar"
			ref={domRef}
		>
			{children}
		</div>
	);
}