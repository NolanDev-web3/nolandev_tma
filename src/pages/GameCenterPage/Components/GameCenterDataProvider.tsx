import { GameData, GameDataParams, GameListResult, GameListType } from "@/components/DashFunData/GameData";
import { GameApi } from "@/utils/DashFunApi";
import { initData, useSignal } from "@telegram-apps/sdk-react";
import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";

const GameCenterContext = createContext<{
	gamelist: GameListResult,
	updateGameList: (types: GameListType[]) => Promise<void>,
	loading: boolean
} | null>(null);

export const GameCenterDataProvider = ({ children }: PropsWithChildren<{}>) => {
	const [gamelist, setGamelist] = useState<GameListResult>(new GameListResult())
	const [loading, setLoading] = useState(false)
	const initDataRaw = useSignal(initData.raw) as string

	const getAllGameList = async () => {
		setLoading(true);
		const r = await GameApi.getGameList(initDataRaw)
		if (r.game_list) {
			gamelist.game_list = r.game_list;
			gamelist.games = r.games.map((g: GameDataParams) => new GameData(g))
			console.log("gamelist", gamelist)
			setGamelist(gamelist)
		}
		setLoading(false);
	}

	const updateGameList = async (types: GameListType[]) => {
		const r = await GameApi.getGameList(initDataRaw, types)
		if (r.game_list) {
			types.forEach(type => {
				gamelist.game_list[type] = r.game_list[type];
			});
			const newGames: GameData[] = r.games?.map((g: GameDataParams) => new GameData(g)) || [];
			const existingGameIds = new Set(gamelist.games.map(game => game.id));
			const mergedGames = [
				...gamelist.games,
				...newGames.filter(game => !existingGameIds.has(game.id))
			];
			gamelist.games = mergedGames;
			setGamelist(gamelist)
		}
	}

	useEffect(() => {
		getAllGameList();
	}, [])


	return <GameCenterContext.Provider value={{ gamelist, updateGameList, loading }}>
		{children}
	</GameCenterContext.Provider>
}

export const useGameCenterData = (): {
	gamelist: GameListResult | null | undefined,
	updateGameList: ((types: GameListType[]) => Promise<void>) | null | undefined,
	loading: boolean | undefined
} => {
	const context = useContext(GameCenterContext);
	return {
		gamelist: context?.gamelist,
		updateGameList: context?.updateGameList,
		loading: context?.loading
	};
}