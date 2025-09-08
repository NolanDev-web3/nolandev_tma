import { FC, useEffect, useState } from "react";
import { Spinner } from "@telegram-apps/telegram-ui";
import { useDashFunGame } from "../DashFun/DashFunGame";
import { GameData } from "../DashFunData/GameData";
import { GameLoadingEvent } from "../Event/Events";
import "./GameLauncher.css";
import { isInTelegram, toTimeString } from "@/utils/Utils";
import { initData, shareURL, useSignal } from "@telegram-apps/sdk-react";
import { Heart, Send } from "lucide-react";
import { GameApi } from "@/utils/DashFunApi";
import { DFButton, DFImage, DFText } from "../controls";
import useDashFunSafeArea from "../DashFun/DashFunSafeArea";

export type GLProps = JSX.IntrinsicElements['div'] & {
	gameId: string | undefined,
	onLoad: (game: GameData) => void,
	onPlayClicked: () => void,
	footer: JSX.Element | null
};

export const GameLauncher: FC<GLProps> = ({ gameId, onLoad, onPlayClicked, footer }) => {

	//const initDataRaw = useLaunchParams().initDataRaw;
	//const [game, setGame] = useState<GameData | null>(null);
	const game = useDashFunGame();
	const [loading, setLoading] = useState(-1);
	const [playText, setPlayText] = useState("Play")
	const initDataRaw = useSignal(initData.raw)

	const { safeArea } = useDashFunSafeArea();

	const [isFavorite, setIsFavorite] = useState<-1 | 0 | 1>(-1); // -1: loading, 0: not favorite, 1: favorite

	// const loadGame = async (gameId: string | undefined): Promise<GameData | undefined> => {
	// 	if (gameId == null) {
	// 		return undefined;
	// 	}

	// 	const game = await GameApi.findGame(gameId, initDataRaw as string)
	// 	if (game != null) {
	// 		setGame(game);
	// 		onLoad(game);
	// 	}
	// }

	const setFavorite = async (gameId: string) => {
		if (gameId == "") {
			return;
		}
		const action = isFavorite == 0 ? "add" : "remove";
		setIsFavorite(-1);
		const result = await GameApi.setUserFavorite(initDataRaw as string, gameId, action)
		if (result) {
			setIsFavorite(action == "add" ? 1 : 0);
		}
	}

	useEffect(() => {
		// loadGame(gameId);
		onLoad(game as GameData);
		const onLoading = (value: number) => {
			console.log("loading....", value)
			setLoading(value);
		}

		if (game != null) {
			GameApi.isUserFavorite(initDataRaw as string, game.id).then((isFavorite) => {
				setIsFavorite(isFavorite ? 1 : 0);
				console.log("isFavorite", isFavorite)
			});
		}

		GameLoadingEvent.addListener(onLoading);
		return () => { GameLoadingEvent.removeListener(onLoading); }
	}, [gameId, game])

	const openTime = game?.openTime || 0;
	const now = Date.now()
	if (openTime > now) {
		setTimeout(() => {
			const t = (openTime - now) / 1000;
			const d = Math.floor(t / 86400);
			const h = Math.floor((t % 86400) / 3600);
			const m = Math.floor((t % 3600) / 60);
			const s = Math.floor(t % 60);

			setPlayText(toTimeString(d, h, m, s))
		}, 1000)
	} else {
		if (playText != "Play") {
			setPlayText("Play")
		}
	}

	return <div className="gl-container" style={{ paddingBottom: safeArea.bottom + "px" }}>
		<div className="flex flex-col p-4 shadow-[0_4px_12px_rgba(0,0,0,0.5)] relative bg-gradient-to-b from-[#1E6493] to-[#0C3D63] rounded-2xl">
			< div className="absolute inset-[2px] ring-[2px] ring-white/50 pointer-events-none rounded-2xl" ></div>
			{game == null ? <div className="gl-loading-spinner"><Spinner size="l" /> </div> :
				<>
					<div className="gl-gametitle-div">
						<div className="gl-gameicon">
							<div className=" relative">
								<DFImage src={game.getIconUrl()} size={96}></DFImage>
								{
									(
										game.status <= 1 &&
										<div className=" absolute left-0 top-[1px] bg-red-400 text-white text-xs font-bold rounded-tl-[10px] rounded-br-[10px] p-1">TEST</div>
									)
								}
							</div>
						</div>
						<DFText weight="3" size="2xl">{game?.name}</DFText>
					</div>
					{
						(
							!isInTelegram() && <div className="py-4 flex flex-row gap-2">
								<div className="flex-1">
									<DFText weight="1" size="sm">{game?.desc}</DFText>
								</div>
								<DFButton
									size="m"
									mode="normal"
									loading={isFavorite == -1}
									onClick={() => {
										setFavorite(game?.id || "");
									}}
								>
									{
										isFavorite == 0 ? <Heart size="24" strokeWidth={2} />
											: <Heart size="24" strokeWidth={0} fill="#ef4444" />
									}
								</DFButton>
							</div>
						)
					}
					{(isInTelegram() && <div className="py-4">
						<DFText weight="1" size="sm">{game?.desc}</DFText>
					</div>)}
					{(isInTelegram() && <div className="flex flex-row items-center gap-2">
						<div className="flex-1">
							<DFButton
								size="m"
								mode="normal"
								onClick={() => {
									if (game != null) {
										shareURL(game.tgLink());
									}
								}}
							>
								<div className="flex justify-center items-center"><Send size="20" strokeWidth={1} absoluteStrokeWidth /> <span className="pl-2">Share game</span></div>
							</DFButton>
						</div>
						<DFButton
							size="m"
							mode="normal"
							loading={isFavorite == -1}
							onClick={() => {
								setFavorite(game?.id || "");
							}}
						>
							{
								isFavorite == 0 ? <Heart size="24" strokeWidth={2} />
									: <Heart size="24" strokeWidth={0} fill="#ef4444" />
							}
						</DFButton>
					</div>)}
				</>}
		</div>
		<div className="gl-playbutton">
			<DFButton size="l" disabled={loading == -1} loading={loading >= 0 && loading < 100} onClick={_ => {
				if (openTime > now) {
					return;
				}
				if (loading >= 100) {
					onPlayClicked?.call([]);
				}
			}}>{playText}</DFButton>
		</div>
		{footer}
	</div>
}