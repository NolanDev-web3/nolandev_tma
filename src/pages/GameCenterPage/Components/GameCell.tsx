import { DFButton, DFText } from "@/components/controls";
import { GameData } from "@/components/DashFunData/GameData";
import { GameIcon } from "@/components/GameIcon/GameIcon";
import { TGLink } from "@/utils/DashFunApi";
import { openTelegramLink } from "@telegram-apps/sdk-react";
import { FC } from "react";

const GameCell: FC<{ game: GameData | undefined }> = ({ game }) => {
	return <div className="w-full px-1 py-1">
		<div className="relative w-full py-2 flex flex-row justify-start items-center pr-4 rounded-xl p-3 shadow-[0_4px_4px_rgba(0,0,0,0.5)] bg-gradient-to-br from-[#1E6493] to-[#0C3D63]">
			<div className="absolute inset-0 rounded-xl ring-1 ring-blue-400/80 pointer-events-none z-0"></div>
			<div className="relative">
				<GameIcon game={game} size={64} onClick={() => { console.log("onclick") }} openGameOnClick={false} />
			</div>
			<div className="flex flex-col px-2 flex-1 w-full min-w-0">
				<DFText weight="1" size="lg" className="min-w-0 truncate flex-shrink-0">{game?.name}</DFText>
				<DFText weight="1" color="var(--tgui--hint_color)" size="sm" className="min-w-0 truncate flex-shrink-0">{game?.desc}</DFText>
			</div>
			<DFButton size="m" className=" w-[70px]" onClick={() => {
				const url = TGLink.gameLink(encodeURIComponent(game?.id ?? ""));
				openTelegramLink(url);
			}}>Play</DFButton>
		</div>
	</div>
}

export default GameCell;