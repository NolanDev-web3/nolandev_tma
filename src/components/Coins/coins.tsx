import { Coin, CoinUserData, getCoinIcon1 } from "@/constats";
import { Avatar, ButtonCell } from "@telegram-apps/telegram-ui";
import { SectionFooter } from "@telegram-apps/telegram-ui/dist/components/Blocks/Section/components/SectionFooter/SectionFooter";
import { Wallet } from "lucide-react";
import { FC } from "react";
import { useDashFunCoins } from "../DashFun/DashFunCoins";
import { GameData } from "../DashFunData/GameData";
import { DashFunUser } from "../DashFunData/UserData";
import Number from "../Utils/Number";
import { DFCell } from "../controls";

export const Coins: FC<{ game: GameData | null, user: DashFunUser | null, onSelected: (coin: Coin) => void }> = ({ game }) => {

	const [coins, _2, _3, getCoinInfo] = useDashFunCoins();

	if (coins == null || game == null) {
		return null;
	}

	const coin = getCoinInfo(game.id, "gameId");
	const withdraw = coin?.coin.can_withdraw && coin.coin.min_withdraw > 0 ? <>
		<ButtonCell
			className="" disabled={true}
			before={<Wallet absoluteStrokeWidth />}
		>Withdraw</ButtonCell>
		<SectionFooter>Minimum withdrawal amount is {coin?.coin.min_withdraw} {coin?.coin.symbol}</SectionFooter></>
		: null

	return <div className=" w-full justify-center items-center p-4">
		<DFCell
			mode="primary"
			disableBeforeRing={true}
			subtitle={"Your Earning: " + coin?.userData.amount.toLocaleString('en-US', { style: "decimal" }) + " " + coin?.coin.symbol}
			before={<Avatar src={getCoinIcon1(coin?.coin ?? null)} size={40} />}
		>
			{coin?.coin.name}
		</DFCell>
		{/* <ButtonCell
				className="" disabled={true}
				before={<i className="fa-solid fa-wallet"></i>}
			>Withdraw</ButtonCell>

			{
				coin?.coin.can_withdraw && coin.coin.min_withdraw > 0 && (
					<SectionFooter>Minimum withdrawal amount is {coin?.coin.min_withdraw} {coin?.coin.symbol}</SectionFooter>
				)
			} */}
		{withdraw}
	</div>
}

export const CoinPanel: FC<{ coin: Coin | null | undefined, userCoinData: CoinUserData | null | undefined, showAdd?: boolean, showBG?: boolean, forceDark?: boolean, onClick?: () => void }> = ({ coin, userCoinData, showBG = false, forceDark = false, onClick }) => {
	return <div className="flex flex-row w-full justify-center items-center  " style={{ height: 28 }} onClick={onClick}>
		{showBG && <div className="w-full flex flex-row" style={{ height: 24 }}>
			<div className={` bg-blue-400 rounded-l-md w-full h-full ${forceDark ? " bg-opacity-30" : " bg-opacity-70"}`}></div>
			<div className=" h-full" style={{ width: 14 }}></div>
		</div>}
		<Number className="text-white text-lg font-semibold w-full text-right pr-1" value={userCoinData?.amount || 0}></Number>
		<div className="rounded-full w-[32px] h-[32px] min-w-[32px]" >
			<img
				className=""
				src={getCoinIcon1(coin)}
				style={{ width: "100%", height: "100%", objectFit: "cover", aspectRatio: "1/1" }}
			/>
		</div>
	</div >
}