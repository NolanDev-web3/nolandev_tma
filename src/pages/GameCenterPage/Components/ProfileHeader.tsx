import { DFProfileAvatar } from "@/components/Avatar/Avatar";
import { CoinPanel } from "@/components/Coins/coins";
import { useDashFunCoins } from "@/components/DashFun/DashFunCoins";
import { useDashFunUser } from "@/components/DashFun/DashFunUser";
import { FC } from "react";
import { useNavigate } from "react-router-dom";

const ProfileHeader: FC<{ disableClick?: boolean }> = ({ disableClick = false }) => {
	const navigator = useNavigate();
	const user = useDashFunUser();

	const onHeaderClicked = () => {
		if (!disableClick) {
			navigator("/game-center/profile");
		}
	}

	//const l = useLocation();

	//所有页面都强制暗色
	const forceDark = true; // l.pathname.endsWith("/main") || themeParams.isDark();
	const [_1, _2, _3, getCoinInfo] = useDashFunCoins();

	const dp = getCoinInfo("NolanDevPoint", "name");
	// const dc = getCoinInfo("DashFunCoin", "name");

	//<div className="flex flex-col items-center w-full gap-2 rounded-xl px-3 py-2 bg-white bg-opacity-10 border-2 border-opacity-30 border-gray-200 " >

	return <div className="flex flex-col items-center w-full gap-2 " >
		<div className="flex flex-row items-center w-full h-full max-w-full justify-center gap-1">
			<DFProfileAvatar size={56} onClick={onHeaderClicked} />
			<div className="flex flex-col flex-1 justify-start w-full min-w-0">
				<span className={`font-semibold text-lg pl-1 truncate overflow-hidden ${forceDark ? "text-white" : ""}`} >
					{user?.nickname || user?.displayName || "Loading..."}
				</span>
				<span className={`text-sm pl-1 truncate overflow-hidden ${forceDark ? "text-white" : ""}`} >
					&nbsp;
				</span>
			</div>
			<div>
				<CoinPanel coin={dp?.coin} userCoinData={dp?.userData} forceDark={forceDark} />
			</div>
		</div>

		{/* 挪到上面了 */}
		{/* <div className="flex p-1 items-center justify-between w-full gap-10 bg-gray-900 bg-opacity-30 rounded-full ">
			<CoinPanel coin={dp?.coin} userCoinData={dp?.userData} forceDark={forceDark} />
			{<CoinPanel coin={dc?.coin} userCoinData={dc?.userData} forceDark={forceDark} />}
			<CoinPanel coin={dd?.coin} userCoinData={dd?.userData} forceDark={forceDark} showAdd onClick={() => {
				navigator("/game-center/recharge");
			}} />
		</div> */}
	</div >
}

export default ProfileHeader;