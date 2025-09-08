import { Coin, CoinInfo, CoinUserData, TaskStatus } from "@/constats"
import { CoinApi } from "@/utils/DashFunApi"
import { useLaunchParams } from "@telegram-apps/sdk-react"
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useReducer, useState } from "react"
import { SpinWheelStatusChangedEvent, TaskStatusChangedEvent, UserActivedEvent, UserXpReached5kEvent } from "../Event/Events"
import { SpinWheelConstants } from "../DashFunData/SpinWheelData"
import { Spinner } from "@telegram-apps/telegram-ui"

export type DashFunCoins = {
	findCoinById: (id: string) => CoinInfo | null
	findCoinByName: (name: string) => CoinInfo | null
	findCoinByGameId: (gameId: string) => CoinInfo | null
}

/**
 * 获取DashFun相关的币种信息和用户数据，不包含游戏对应的币种信息
 * @returns 
 */
export const UseDashFunCoins = (): DashFunCoins => {
	const [coins, setCoins] = useState<Coin[]>([])
	const [userData, setUserData] = useState<{ [key: string]: CoinUserData } | null>(null)
	const initDataRaw = useLaunchParams().initDataRaw;

	const getCoins = async () => {
		const result1 = await CoinApi.getCoinList(initDataRaw as string, ["DashFun"], "gameId") as Coin[];
		const result2 = await CoinApi.getCoinUserDataList(initDataRaw as string, ["DashFun"], "gameId") as { [key: string]: CoinUserData };

		// console.log("======", result1, result2)

		// const result = await CoinApi.getCoins(initDataRaw as string) as { coins: Coin[], user_data: { [key: string]: CoinUserData } }
		// console.log("get coin result:", result)
		setCoins(result1);
		setUserData(result2);
	}

	useEffect(() => {
		getCoins()
	}, [])

	useEffect(() => {
		const evtListener = (taskId: string, status: number) => {
			console.log(taskId);
			if (status == TaskStatus.Claimed) {
				//任务变为已领取，需要刷新用户的coin余额
				console.log("request get coin balance.....")
				getCoins();
			}
		}

		const spinListener = (spinId: string, status: number) => {
			console.log(spinId)
			if (status == SpinWheelConstants.Status.Claimed) {
				//用户Claim了奖励
				getCoins();
			}
		}

		TaskStatusChangedEvent.addListener(evtListener);
		SpinWheelStatusChangedEvent.addListener(spinListener);
		return () => {
			TaskStatusChangedEvent.removeListener(evtListener);
			SpinWheelStatusChangedEvent.removeListener(spinListener);
		}

	}, [coins]);

	const findCoin = (s: string, p: "id" | "name" | "gameId" = "id") => {
		for (let i = 0; i < coins.length; i++) {
			const c = coins[i];
			let pc = "";
			switch (p) {
				case "id":
					pc = c.id;
					break;
				case "name":
					pc = c.name;
					break;
				case "gameId":
					pc = c.bind_game_id
					break;
			}

			if (pc == s && s != "") {
				return c;
			}
		}
		return null;
	}

	const toCoinInfo = (coin: Coin) => {
		if (userData == null) { return null; }
		const save = userData[coin.id];

		return {
			coin: coin,
			userData: save
		}
	}

	const ret: DashFunCoins = {
		findCoinById: function (id: string) {
			if (coins == null || userData == null) return null;
			const coin = findCoin(id);
			if (coin == null) {
				return null;
			}
			return toCoinInfo(coin)
		},

		findCoinByName: function (name: string) {
			if (coins == null || userData == null) return null;
			const coin = findCoin(name, "name");
			if (coin == null) {
				return null;
			}
			return toCoinInfo(coin)
		},

		findCoinByGameId: (gameId: string) => {
			if (coins == null || userData == null) return null;
			const coin = findCoin(gameId, "gameId")
			if (coin == null) {
				return coin;
			}
			return toCoinInfo(coin)
		}
	}

	return ret
}


export type DashFunCoinsInfo = {
	info: CoinInfo[],
	findCoin: (id: string, idType: "id" | "gameId") => CoinInfo | null
}


const CoinContext = createContext<{
	coins: { [key: string]: Coin },
	userCoinData: { [key: string]: CoinUserData },
	updateCoins: (gameIds: string[]) => Promise<void>
} | null>(null);

/**
 * name to coin的缓存
 */
let coinsCache: { [key: string]: Coin } = {}

export const CoinProvider = ({ children }: PropsWithChildren<{}>) => {
	// key = coin id
	const initDataRaw = useLaunchParams().initDataRaw;

	const coinReducer = (state: { [key: string]: Coin }, action: { type: string, payload: Coin[] }) => {
		switch (action.type) {
			case 'SET_COINS':
				const updatedCoins = { ...state };
				action.payload.forEach(coin => {
					updatedCoins[coin.id] = coin;
				});
				Object.values(updatedCoins).forEach(coin => {
					coinsCache[coin.name] = coin;
				});
				console.log("coin provider set coins:", updatedCoins, coinsCache)
				return updatedCoins;
			default:
				return state;
		}
	};

	const userCoinDataReducer = (state: { [key: string]: CoinUserData }, action: { type: string, payload: { [key: string]: CoinUserData } }) => {
		switch (action.type) {
			case 'ADD_USER_COIN_DATA':
				const dashfunXp = coinsCache["DashFunPoint"];

				if (dashfunXp != null) {
					Object.values(action.payload).forEach(userData => {
						if (userData.coin_id == dashfunXp.id) {
							//记录xp已经达到5000的用户，只要到了就算，只记录一次
							if (userData.amount >= 5000) {
								const saveKey = `DashFun-Xp-5K-${userData.user_id}`;
								const v = localStorage.getItem(saveKey);
								if (v == null) {
									localStorage.setItem(saveKey, "1");
									UserXpReached5kEvent.fire(userData.user_id);
								}
							}
							//dashfunxp，需要记录变化到5000以上的用户，做为激活用户统计
							const oldData = state[dashfunXp.id];
							if (oldData != null && oldData.amount < 5000 && userData.amount >= 5000) {
								//发送激活用户事件
								UserActivedEvent.fire(userData.user_id);
							}
						}
					});
				}
				return { ...state, ...action.payload };
			default:
				return state;
		}
	};

	const [coins, dispatchCoins] = useReducer(coinReducer, {});
	const [userCoinData, dispatchUserCoinData] = useReducer(userCoinDataReducer, {});

	const getDashFunCoins = async () => {
		const result1 = await CoinApi.getCoinList(initDataRaw as string, ["DashFun"], "gameId") as Coin[];
		const result2 = await CoinApi.getCoinUserDataList(initDataRaw as string, ["DashFun"], "gameId") as { [key: string]: CoinUserData };

		dispatchCoins({ type: 'SET_COINS', payload: result1 });
		dispatchUserCoinData({ type: 'ADD_USER_COIN_DATA', payload: result2 });
	}

	const getCoinsByGames = async (gameId: string[]) => {
		const existingGameIds = new Set(Object.values(coins).map(coin => coin.bind_game_id));
		const gameIdsToFetch = gameId.filter(id => !existingGameIds.has(id));
		if (gameIdsToFetch.length > 0) {
			const cs = await CoinApi.getCoinList(initDataRaw as string, gameIdsToFetch, "gameId") as Coin[];
			dispatchCoins({ type: 'SET_COINS', payload: cs });
		}
		const userdata = await CoinApi.getCoinUserDataList(initDataRaw as string, gameId, "gameId") as { [key: string]: CoinUserData };
		dispatchUserCoinData({ type: 'ADD_USER_COIN_DATA', payload: userdata });

		return { coins, userCoinData };
	}


	const updateCoins = async (gameIds: string[]): Promise<void> => {
		await getCoinsByGames(gameIds);
	}
	// async (gameIds: string[]): Promise<void> => {
	// 	await getCoinsByGames(gameIds);
	// 	const coinsInfo: CoinInfo[] = [];


	// 	ids.forEach(id => {
	// 		const coin = Object.values(coins).find(c => idType === "gameId" ? c.bind_game_id === id : c.id === id);
	// 		if (coin) {
	// 			const info = {
	// 				coin: coin,
	// 				userData: userCoinData[coin.id]
	// 			}
	// 			coinsInfo.push(info);
	// 		}
	// 	});
	// 	return {
	// 		info: coinsInfo,
	// 		findCoin(id: string, idType: "id" | "gameId" = "id"): CoinInfo | null {
	// 			const r = coinsInfo.find(c => idType === "gameId" ? c.coin.bind_game_id === id : c.coin.id === id)
	// 			return r || null;
	// 		}
	// 	};
	// }

	useEffect(() => {
		getDashFunCoins();
		console.log("coin provider init.....");

		//TODO 增加接口中的gameId
		const evtListener = (taskId: string, status: number) => {
			console.log(taskId);
			if (status == TaskStatus.Claimed) {
				//任务变为已领取，需要刷新用户的coin余额
				console.log("request get coin balance.....")
				// 默认获取 DashFun 的币种信息
				getCoinsByGames([""]);
			}
		}

		const spinListener = (spinId: string, status: number) => {
			console.log(spinId)
			if (status == SpinWheelConstants.Status.Claimed) {
				//用户Claim了奖励
				// 默认获取 DashFun 的币种信息
				getCoinsByGames([""]);
			}
		}

		TaskStatusChangedEvent.addListener(evtListener);
		SpinWheelStatusChangedEvent.addListener(spinListener);
		return () => {
			TaskStatusChangedEvent.removeListener(evtListener);
			SpinWheelStatusChangedEvent.removeListener(spinListener);
		}
	}, []);
	return <CoinContext.Provider value={{ coins, userCoinData, updateCoins }}>
		{coins == null ? <div className="w-full h-full items-center justify-center flex"><Spinner size={"l"} /></div> : children}
	</CoinContext.Provider>
}

// export const useDashFunCoins = (ids: string[], idType: "id" | "gameId" = "id") => {
// 	const [coinsInfo, setCoinsInfo] = useState<{ [key: string]: CoinInfo } | null>(null);
// 	const coinContext = useContext(CoinContext);

// 	useEffect(() => {
// 		const fetchCoinsInfo = async () => {
// 			if (coinContext) {
// 				const info = await coinContext.getCoinsInfo(ids, idType);
// 				setCoinsInfo(info);
// 			}
// 		};

// 		fetchCoinsInfo();
// 	}, [ids, idType, coinContext]);

// 	return coinsInfo;
// }

export const useDashFunCoins = () => {
	const coinContext = useContext(CoinContext);
	const coins = coinContext?.coins || {};
	const userCoinData = coinContext?.userCoinData || {};
	const updateCoins = coinContext?.updateCoins;

	const getCoinInfo = useCallback((id: string, idType: "id" | "gameId" | "name" = "id") => {
		const coin = Object.values(coins).find(c => {
			if (idType === "gameId") {
				return c.bind_game_id === id;
			} else if (idType === "name") {
				return c.name === id;
			} else {
				return c.id === id;
			}
		});
		if (coin) {
			const info: CoinInfo = {
				coin: coin,
				userData: userCoinData[coin.id]
			}
			return info;
		}
		return null;
	}, [coinContext?.coins, coinContext?.userCoinData]);

	return [coinContext?.coins, coinContext?.userCoinData, updateCoins, getCoinInfo] as const;
}