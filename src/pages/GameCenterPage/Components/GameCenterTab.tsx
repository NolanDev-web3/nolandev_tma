import { DFBadge } from "@/components/controls";
import useDashFunSafeArea from "@/components/DashFun/DashFunSafeArea";
import { TaskStatusChangedEvent } from "@/components/Event/Events";
import { TaskStatus } from "@/constats";
import { AppRoute, routes } from "@/navigation/routes";
import { TaskApi } from "@/utils/DashFunApi";
import { useLaunchParams } from "@telegram-apps/sdk-react";
import { Tabbar } from "@telegram-apps/telegram-ui";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

//selectedTab不用了，改为使用location自动判断选中的是哪个tab


const useScreenWidth = () => {
	const [screenWidth, setScreenWidth] = useState(window.innerWidth);

	useEffect(() => {
		const handleResize = () => setScreenWidth(window.innerWidth);
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return screenWidth;
};

export const GameCenterTab = forwardRef<GameCenterTabRef>(({ }, ref) => {
	const divRef = useRef<HTMLDivElement>(null);
	const { safeArea } = useDashFunSafeArea();
	const navigate = useNavigate();
	const l = useLocation();
	const initDataRaw = useLaunchParams().initDataRaw;
	const [taskCount, setTaskCount] = useState<{ [key: number]: number }>({})

	const screenWidth = useScreenWidth();
	const bottom = safeArea.bottom;

	const getTaskCount = async () => {
		const count = await TaskApi.getCount(initDataRaw as string, "DashFun")
		setTaskCount(count);
	}

	const evtListener = (_taskId: string, _status: number) => {
		//任务状态变化，重新获取task count
		getTaskCount();
	}

	useEffect(() => {
		getTaskCount();
		TaskStatusChangedEvent.addListener(evtListener);
		return () => {
			TaskStatusChangedEvent.removeListener(evtListener);
		}
	}, [])


	const gamecenter = routes.find(r => r.id == "gamecenter") as AppRoute;
	const main = gamecenter.subRoutes?.find(r => r.id == "gamecenter-main") as AppRoute;
	const games = gamecenter.subRoutes?.find(r => r.id == "gamecenter-games") as AppRoute;
	const tasks = gamecenter.subRoutes?.find(r => r.id == "gamecenter-tasks") as AppRoute;
	const tops = gamecenter.subRoutes?.find(r => r.id == "gamecenter-tops") as AppRoute;


	useImperativeHandle(ref, () => ({
		getHeight: () => {
			const divTab = divRef.current?.querySelector("#bottomNavigation") as HTMLElement;
			return divTab?.offsetHeight || 0;
		}
	}))

	const fullpath = (path: string): string => {
		return "/game-center/" + path;
	}

	const tc = taskCount == null || taskCount[TaskStatus.Completed] == null ? 0 : taskCount[TaskStatus.Completed]

	const tabs: AppRoute[] = [
		games,
		main,
		tops,
	]

	const tabItems = [];
	for (let index = 0; index < tabs.length; index++) {
		const { path, title, icon } = tabs[index];
		const selected = l.pathname.endsWith(path);
		tabItems.push(<Tabbar.Item
			key={path}
			text={screenWidth <= 430 ? "" : title}
			selected={selected}
			onClick={() => {
				if (!selected) {
					console.log("navigate to " + fullpath(path));
					navigate(fullpath(path));
				}
			}}
		>
			<div className="relative flex justify-center items-center my-1">
				{title == tasks.title && <DFBadge color="red">{tc}</DFBadge>}
				{icon}
			</div>
		</Tabbar.Item>)
	}

	return <div ref={divRef} >
		<Tabbar id="bottomNavigation"
			style={{ paddingBottom: bottom + "px" }}
			className="max-w-screen-sm sm:left-[50%] sm:right-[-50%] sm:translate-x-[-50%]"
		>
			{tabItems}
		</Tabbar>
	</div>
})

export interface GameCenterTabRef {
	getHeight: () => number;
}
