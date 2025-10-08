import { FC } from "react";
import ProfileHeader from "../Components/ProfileHeader";
import CryptoForecastChart from "../Components/CryptoForecastChart";

// nft shop
export const GameCenter_GamesPage: FC = () => {
	return <div id="GameCenter_GamesPage" className="w-full p-4">
		<ProfileHeader />
		<div className="py-2"></div>
		<div style={{ padding: "20px" }}>
			<CryptoForecastChart symbol="BTCUSDT" />
			<div className="h-6"></div>
			<CryptoForecastChart symbol="ETHUSDT" />
		</div>
	</div>
}