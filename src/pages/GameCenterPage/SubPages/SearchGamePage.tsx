import { Button, Divider, Input, Spinner } from "@telegram-apps/telegram-ui";
import { Search, X } from "lucide-react";
import { FC, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGameCenterData } from "../Components/GameCenterDataProvider";
import { GameData, GameListType } from "@/components/DashFunData/GameData";
import { GameIcon } from "@/components/GameIcon/GameIcon";
import { GameApi } from "@/utils/DashFunApi";
import { useLaunchParams } from "@telegram-apps/sdk-react";
import { Player } from "@lottiefiles/react-lottie-player";

import searchAni from "@/assets/animation/search.json";
import noResult from "@/assets/animation/no-result.json";
import GameCell from "../Components/GameCell";
import { DFText } from "@/components/controls";

const sizePerPage = 5;
export const GameCenter_SearchPage: FC = () => {
	const [searchResult, setSearchResult] = useState<GameData[] | null>(null);
	const [page, setPage] = useState({ current: 1, total: 1 });
	const [searchKeyword, setSearchKeyword] = useState("");
	const [loadMore, setLoadMore] = useState(false);
	const [isSearching, setIsSearching] = useState(false);
	const initDataRaw = useLaunchParams().initDataRaw;

	const onSearch = async (keyword: string) => {
		console.log("searching", keyword);
		setSearchKeyword(keyword);
		if (keyword === "") {
			setIsSearching(false);
			setSearchResult(null);
			return;
		} else {
			setIsSearching(true);
			try {
				const result = await GameApi.gameSearch(initDataRaw as string, keyword, 1, [], sizePerPage);
				setTimeout(() => {
					console.log("rrrrrresult", result)
					setPage({ current: 1, total: result.total_pages });
					setSearchResult(result.data);
					setIsSearching(false);
				}, Math.floor(Math.random() * 1000) + 1000);

			} catch (error) {
				console.error(error);
				setSearchResult([]);
			}
		}
	}

	const showMore = async () => {
		setLoadMore(true);
		try {
			const result = await GameApi.gameSearch(initDataRaw as string, searchKeyword, page.current + 1, [], sizePerPage);
			setTimeout(() => {
				setPage({ current: result.page, total: result.total_pages });
				setSearchResult([...(searchResult || []), ...result.data]);
				setLoadMore(false);
			}, Math.floor(Math.random() * 500) + 500);
		} catch (error) {
			console.error(error);
			setLoadMore(false);
		}
	}

	return <div id="GameCenter_SearchPage" className="w-full h-full flex flex-col p-4 overflow-y-auto">
		<SearchHeader onSearch={onSearch} isSearching={isSearching} />
		<div className="w-full py-2 "><Divider /></div>
		{searchResult == null && !isSearching && <MonstPopular />}
		{!isSearching && searchResult != null && searchResult.length == 0 && <NotFoundInfo />}
		{isSearching && <Searching />}

		{
			!isSearching && searchResult != null && searchResult.length > 0 &&
			<div className="w-full flex flex-col ">
				<div>
					{searchResult.map((game, index) => (
						<div key={index}>
							<GameCell game={game} />
						</div>
					))}
				</div>
				{
					page.total > page.current && <div className="w-full flex justify-center pt-2">
						{loadMore ? <Spinner size="s" /> : <Button mode="plain" size="m" onClick={showMore}>Show More</Button>}
					</div>
				}
			</div>
		}

	</div>
}

const MonstPopular: FC = () => {
	const { gamelist } = useGameCenterData();
	const populars = gamelist?.game_list[GameListType.Popular] ?? [];
	const suggest = gamelist?.game_list[GameListType.Suggest] ?? [];
	const banner = gamelist?.game_list[GameListType.Banner] ?? [];

	const all = [...populars, ...suggest, ...banner];
	const uniqueAll = Array.from(new Set(all));
	const shuffledAll = uniqueAll.sort(() => Math.random() - 0.5);
	const topTenShuffledAll = shuffledAll.slice(0, 10);

	return <div className="w-full flex flex-col gap-4 ">
		<DFText weight="2" size="lg" className=" font-semibold">Most Popular</DFText>
		<div className="w-full overflow-x-auto hide-scrollbar">
			<div>
				<div className="grid grid-flow-col-dense auto-cols-max gap-2 min-h-[64px]">
					{topTenShuffledAll.map((gameId) => {
						const game = gamelist?.getGame(gameId);
						return <div key={gameId} className="flex flex-col gap-2 ">
							<GameIcon game={game} size={80} onClick={() => {
							}}>
							</GameIcon>
							<div className="w-[80px] min-w-0 truncate text-center">
								<DFText weight="1" size="xs">{game?.name}</DFText>
							</div>
						</div>
					})}
				</div>
			</div>
		</div>
	</div>
}

const SearchHeader: FC<{ isSearching?: boolean, onSearch: (keyword: string) => void }> = ({ isSearching = false, onSearch }) => {
	const navigate = useNavigate();
	const inputRef = useRef<HTMLInputElement>(null);


	return <div className="flex flex-row items-center w-full gap-2">
		<div className="flex-1">
			<Input
				ref={inputRef}
				id="inputSearchGame"
				placeholder="Search Games"
				before={<Search strokeWidth={2} absoluteStrokeWidth color="gray" />}
				after={isSearching ? <Spinner size="s" /> :
					<X color="gray" absoluteStrokeWidth strokeWidth={4} onClick={() => {
						if (inputRef.current) {
							inputRef.current.value = "";
							clearTimeout((inputRef.current as any).searchTimeout);
							onSearch("");
						}
					}} />}
				onChange={() => {
					if (inputRef.current) {
						clearTimeout((inputRef.current as any).searchTimeout);
						(inputRef.current as any).searchTimeout = setTimeout(() => {
							const value = inputRef.current?.value || "";
							if (onSearch)
								onSearch(value);
						}, 1000);
					}
				}}
				autoFocus={true}
				tabIndex={-1}
			/>
		</div>
		<Button mode="plain" size="m" onClick={() => {
			navigate("/game-center/games")
		}}>Cancel</Button>
	</div>
}

const NotFoundInfo: FC = () => {
	return (
		<div className="flex flex-col items-center h-full justify-center gap-4 pt-12">
			<Player
				autoplay
				loop
				src={noResult}
				style={{ width: "150px" }}
			/>
			<p className="font-bold text-lg ">No Results</p>
		</div>
	);
};

const Searching: FC = () => {
	return (
		<div className="flex flex-col items-center h-full justify-center gap-4 pt-12">
			<Player
				autoplay
				loop
				src={searchAni}
				style={{ width: "250px" }}
			/>
		</div>
	);
}