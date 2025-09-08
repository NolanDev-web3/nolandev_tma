import { FC } from "react"
import { GameData } from "../DashFunData/GameData"
import { TGLink } from "@/utils/DashFunApi"
import { openTelegramLink } from "@telegram-apps/sdk-react"
import { DFImage } from "../controls"

export const GameIcon: FC<{
	game: GameData | undefined,
	size: number,
	openGameOnClick?: boolean,
	onClick?: () => void
}> = ({ game, size, openGameOnClick = true, onClick }) => {
	return <div className=" items-center rounded-xl relative cursor-pointer" onClick={() => {
		if (openGameOnClick) {
			if (game != null) {
				const url = TGLink.gameLink(encodeURIComponent(game.id));
				openTelegramLink(url);
			}
		}
		if (onClick != null) {
			onClick();
		}
	}} >
		<DFImage src={game?.getIconUrl() || ""} size={size} />
	</div>
}