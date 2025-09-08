import { FC } from "react";
import ProfileHeader from "../Components/ProfileHeader";
import UnderConstruction from "../Components/UnderConstruction";

// nft shop
export const GameCenter_GamesPage: FC = () => {
	return <div id="GameCenter_GamesPage" className="w-full p-4">
		<ProfileHeader />
		<div className="py-2"></div>
		<UnderConstruction />
	</div>
}