import { GameData, GameDataList, GameDataParams } from "@/components/DashFunData/GameData"
import { DashFunUser } from "@/components/DashFunData/UserData"
import axios from "axios"
import { currentChannel, isInTelegram } from "./Utils"
import { Base64 } from 'js-base64';
import { FishingPostData, FishingVerseUserProfile, SpinWheelInfo } from "@/constats";
import { ForecastPoint, ForecastResponse } from "@/pages/GameCenterPage/Components/CryptoForecastChart";

enum Env {
	Dev,
	Test,
	Prod
}

let env: Env = Env.Test

//const api_local = "https://tma-server-test.nexgami.com/api/v1/"
const api_local = "http://localhost:8088/api/v1/"
const api_test = "https://dashfun-server-test.nexgami.com/api/v1/"
const api_prod = "https://server.nolandevq.com/api/v1/"

export const getImageUrl = (id: string | undefined, url: string | undefined) => {
	if (url?.startsWith("http")) {
		return url;
	} else {
		return `https://res.dashfun.games/images/${id}/${url}`;
	}
}

export const getAvatarUrl = (userId: string, version: string) => {
	const avatarPath = `avatar_${userId}.png?v=${version}`;
	return `https://res.dashfun.games/images/users/${avatarPath}`;
}

const api_url = () => {
	const url = window.location.href;
	if (url.indexOf("://dashfun-test") >= 0) {
		//test环境允许http
		env = Env.Test

		return api_test;
	}
	if (url.indexOf("https://tma.nolandevq.com") >= 0) {
		env = Env.Prod

		return api_prod;
	}
	if (url.indexOf("https://app.nolandevq.com") >= 0) {
		env = Env.Prod

		return api_prod;
	}
	env = Env.Dev
	return api_local;
	// return api_test;
}

const dashFunApiUrl = api_url()

const processToken = (token: string) => {
	// const platform = retrieveLaunchParams().platform;
	// const info = {
	// 	platform,
	// 	token
	// }
	// return JSON.stringify(info);

	if (isInTelegram()) {
		return "tma " + token;
	} else {
		return "duc " + token;
	}
}

enum AccountStatus {
	Unvalidated = 0,
	Normal = 1,
	Frozen = 2,
	Deleted = 3,
}
enum AccountType {
	Email = 1,
	Telegram = 2,
	AppleId = 3,
}

type DashFunAccount = {
	account_id: string,
	username: string,
	type: AccountType,
	status: AccountStatus
	token: string,
	display_name: string,
}

type AirdropData = {
	start_time: number,
	claim_time: number,
	token_amount: string,
	claimed: boolean,
	vesting_contract: string,
	token_contract: string,
	claim_address: string,
	ku_coin_id: string,
}

type AirdropVestingRequest = {
	existed: boolean,
	request: {
		user_id: string,
		address: string,
		token_amount: string,
		kc_uid: string,
		status: number,
		result: string,
	} | null,
}

type TokenMarketInfo = {
	id: string;
	symbol: string;
	name: string;
	current_price: number;
	high_24h: number;
	low_24h: number;
	market_cap: number;
	total_volume: number;
	price_change_percentage_1h_in_currency: number;
	price_change_percentage_24h: number;
	price_change_percentage_7d_in_currency: number;
	last_updated: string;
	brief: string;
};

const AccApi = {
	apiUrl: (): string => {
		return dashFunApiUrl + "acc/"
	},

	create: async (username: string, password: string, acc_type: AccountType): Promise<DashFunAccount> => {
		const api = AccApi.apiUrl() + "create";
		const result = await axios.post(api, {
			username,
			password,
			acc_type
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data;
			} else {
				throw result.data.msg
			}
		} else {
			throw result.status
		}
	},

	login: async (username: string, password: string, acc_type: AccountType): Promise<DashFunAccount> => {
		const api = AccApi.apiUrl() + "login"
		const result = await axios.post(api, {
			username,
			password,
			acc_type
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data;
			} else {
				throw result.data.msg
			}
		} else {
			throw result.status
		}
	},

	requestSendEmail: async (accountId: string): Promise<string> => {
		const api = AccApi.apiUrl() + "send_email"
		const result = await axios.post(api, {
			account_id: accountId
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data;
			} else {
				throw result.data.msg
			}
		} else {
			throw result.status
		}
	},

	deleteAccount: async (accountId: string, token: string, acc_type: AccountType): Promise<string> => {
		const api = AccApi.apiUrl() + "delete"
		const result = await axios.post(api, {
			account_id: accountId,
			token,
			acc_type
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data;
			} else {
				throw result.data.msg
			}
		} else {
			throw result.status
		}
	},

	verifyEmail: async (accountId: string, code: string): Promise<DashFunAccount> => {
		const api = AccApi.apiUrl() + "verify_email"
		const result = await axios.post(api, {
			account_id: accountId,
			code
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data;
			} else {
				throw result.data.msg
			}
		} else {
			throw result.status
		}
	},

	checkToken: async (accountId: string, token: string, acc_type: AccountType): Promise<DashFunAccount> => {
		const api = AccApi.apiUrl() + "check_token"
		const result = await axios.post(api, {
			account_id: accountId,
			token,
			acc_type
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data;
			} else {
				throw result.data.msg
			}
		} else {
			throw result.status
		}
	},

	requestResetPassword: async (username: string): Promise<string> => {
		const api = AccApi.apiUrl() + "request_reset_password"
		const result = await axios.post(api, {
			username
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data;
			} else {
				throw result.data.msg
			}
		} else {
			throw result.status
		}
	},

	resetPassword: async (username: string, code: string, password: string): Promise<string> => {
		const api = AccApi.apiUrl() + "reset_password"
		const result = await axios.post(api, {
			username,
			code,
			password
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data;
			} else {
				throw result.data.msg
			}
		} else {
			throw result.status
		}
	},

}

const UserApi = {
	apiUrl: (): string => {
		return dashFunApiUrl + "user/"
	},

	getAvatar: async (tgToken: string): Promise<string> => {
		const api = UserApi.apiUrl() + "avatar"
		const result = await axios.get(api, {
			headers: {
				"Authorization": processToken(tgToken)
			},
			responseType: "blob"
		})
		if (result.status == 200) {
			return URL.createObjectURL(result.data);
		} else {
			//用户没有头像
			return "";
		}
	},

	tgLogin: async (tgToken: string, referrerId: string = ""): Promise<DashFunUser> => {
		const api = UserApi.apiUrl() + "tg_login"
		const formData = new FormData();
		formData.append("referrer_id", referrerId);
		const result = await axios.post(api, formData, {
			headers: {
				"Authorization": processToken(tgToken)
			},
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return new DashFunUser(result.data.data)
			} else {
				throw result.data.msg
			}
		} else {
			throw result.status
		}
	},

	webLogin: async (tgToken: string, referrerId: string = ""): Promise<DashFunUser> => {
		const api = UserApi.apiUrl() + "tg_login"
		const formData = new FormData();
		formData.append("referrer_id", referrerId);
		const result = await axios.post(api, formData, {
			headers: {
				"Authorization": "duc " + processToken(tgToken)
			},
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return new DashFunUser(result.data.data)
			} else {
				throw result.data.msg
			}
		} else {
			throw result.status
		}
	},

	enterGame: async (tgToken: string, gameId: string): Promise<DashFunUser> => {
		const api = UserApi.apiUrl() + "enter_game"
		const result = await axios.get(api, {
			headers: {
				"Authorization": processToken(tgToken)
			},
			params: {
				game_id: gameId
			}
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return new DashFunUser(result.data.data)
			} else {
				throw result.data.msg
			}
		} else {
			throw result.status
		}
	},

	bindWalletAddress: async (tgToken: string, address: string): Promise<any> => {
		const api = UserApi.apiUrl() + "bind_wallet"
		const result = await axios.post(api, {
			chain: "Ton",
			address
		}, {
			headers: {
				"Authorization": processToken(tgToken)
			}
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data
			} else {
				throw result.data.msg
			}
		} else {
			throw result.status
		}
	},

	userAvatar: async (tgToken: string, userId: string, photoFile: string): Promise<string> => {
		const api = UserApi.apiUrl() + `${userId}/avatar`
		const result = await axios.get(api, {
			params: {
				photo_path: photoFile
			},
			headers: {
				"Authorization": processToken(tgToken)
			},
			responseType: "blob"
		})
		if (result.status == 200) {
			return URL.createObjectURL(result.data);
		} else {
			//用户没有头像
			return "";
		}
	}
}

const GameApi = {
	apiUrl: (): string => {
		return dashFunApiUrl + "game/"
	},
	findGame: async (gameId: string, tgToken: string): Promise<GameData> => {

		if (gameId.startsWith("test-") /*&& env != Env.Prod*/) {
			//for test
			const encoded = gameId.slice("test-".length)
			const url = Base64.decode(encoded)

			console.log("decoded url::::", url);
			return new GameData({
				id: "ForTest",
				name: "Test Game",
				desc: "Only For Test -- " + url,
				mainPicUrl: "",
				logoUrl: "logo.png",
				url: url,
				genre: [1],
				iconUrl: "icon.png",
				time: 0,
				openTime: 0,
				status: 1,
				suggest: 0,
			});
		}


		const api = GameApi.apiUrl() + gameId
		const result = await axios.get(api, {
			headers: {
				"Authorization": processToken(tgToken)
			}
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return new GameData(result.data.data);
			} else {
				throw result.data.msg
			}
		} else {
			throw result.status
		}
	},

	getTestingGames: async (tgToken: string) => {
		const api = GameApi.apiUrl() + "testing"
		const result = await axios.get(api, {
			headers: {
				"Authorization": processToken(tgToken)
			}
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data;
			} else {
				throw result.data.msg
			}
		} else {
			throw result.status
		}
	},

	/**
	 * 保存数据接口，供游戏将本地数据保存到dashfun服务器
	 * @param gameId 
	 * @param tgToken 
	 * @param saveData 
	 * @returns 
	 */
	setData: async (gameId: string, tgToken: string, key: string, data: any) => {
		const api = GameApi.apiUrl() + gameId + "/data"

		let strToEncode = "";
		if (typeof (data) == "string") {
			strToEncode = data;
		} else {
			strToEncode = JSON.stringify(data);
		}

		const result = await axios.post(api, {
			key, data: strToEncode
		}, {
			headers: {
				"Authorization": processToken(tgToken)
			}
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data
			} else {
				throw result.data.msg
			}
		} else {
			throw result.status
		}
	},

	/**
	 * 读取数据接口，供游戏从dashfun服务器读取数据,返回的数据是data:string
	 * @param gameId 
	 * @param tgToken 
	 * @param key 
	 * @returns 
	 */
	getData: async (gameId: string, tgToken: string, key: string) => {
		console.log("GetData:", gameId, key)
		const api = GameApi.apiUrl() + gameId + "/data"


		const result = await axios.get(api, {
			headers: {
				"Authorization": processToken(tgToken)
			},
			params: {
				key
			}
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data
			} else {
				throw result.data.msg
			}
		} else {
			throw result.status
		}
	},


	/**
	 * 读取数据接口，供游戏从dashfun服务器读取数据，返回的数据是{key:string, data:string}
	 * @param gameId 
	 * @param tgToken 
	 * @param key 
	 * @returns 
	 */
	getDataV2: async (gameId: string, tgToken: string, key: string) => {
		console.log("GetData:", gameId, key)
		const api = GameApi.apiUrl() + gameId + "/data_v2"


		const result = await axios.get(api, {
			headers: {
				"Authorization": processToken(tgToken)
			},
			params: {
				key
			}
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data
			} else {
				throw result.data.msg
			}
		} else {
			throw result.status
		}
	},

	gameSearch: async (tgToken: string, keyword: string = "", page: number = 1, genre: number[] = [], size: number = 10): Promise<GameDataList> => {
		const api = GameApi.apiUrl() + "search"
		const result = await axios.post(api, {
			keyword,
			genre,
			size,
			page

		}, {
			headers: {
				"Authorization": processToken(tgToken)
			},
		},
		)
		console.log("gameSearch:", result)
		if (result.status == 200) {
			if (result.data.code == 0) {
				if (result.data.data) {
					const data = result.data.data.data?.map((item: GameDataParams) => new GameData(item)) ?? [];
					return new GameDataList(data, result.data.data.page, result.data.data.size, result.data.data.total_pages);
				} else {
					throw result.data.msg
				}
			} else {
				throw result.data.msg
			}
		} else {
			throw result.status
		}
	},

	getGameList: async (tgToken: string, listTypes: number[] = []) => {
		const api = GameApi.apiUrl() + "game_list"
		const result = await axios.get(api, {
			headers: {
				"Authorization": processToken(tgToken)
			},
			params: {
				list_type: listTypes
			}
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data;
			} else {
				throw result.data.msg
			}
		} else {
			throw result.status
		}
	},

	isUserFavorite: async (tgToken: string, gameId: string): Promise<boolean> => {
		const api = GameApi.apiUrl() + gameId + "/favorite"
		const result = await axios.get(api, {
			headers: {
				"Authorization": processToken(tgToken)
			},
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data as boolean;
			} else {
				throw result.data.msg
			}
		} else {
			throw result.status
		}
	},

	setUserFavorite: async (tgToken: string, gameId: string, action: "add" | "remove"): Promise<boolean> => {
		const api = GameApi.apiUrl() + gameId + "/favorite"
		const formData = new FormData();
		formData.append("action", action);
		const result = await axios.post(api, formData, {
			headers: {
				"Authorization": processToken(tgToken)
			}
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data as boolean;
			} else {
				throw result.data.msg
			}
		} else {
			throw result.status
		}
	}
}

type PaymentData = {
	id: string,
	userId: string,
	game_id: string,
	payment_id: string,
	title: string,
	description: string,
	payload: string,
	currency: string,
	from: number,
	price: number,
	extraData: string,
	message: string,
	created_at: number,
	pay_at: number,
	status: number,
}

const PaymentApi = {
	apiUrl: (): string => {
		return dashFunApiUrl + "payment/"
	},

	requestTGPayment: async (tgToken: string, request: { game_id: string, title: string, desc: string, payload: string, price: number }) => {
		const api = PaymentApi.apiUrl() + "request/tg"
		const result = await axios.get(api, {
			headers: {
				"Authorization": processToken(tgToken)
			},
			params: request
		});
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data;
			} else {
				throw result.data.msg
			}
		} else {
			throw result.status
		}
	},

	requestPayment: async (tgToken: string, request: { game_id: string, title: string, desc: string, payload: string, price: number }) => {
		const api = PaymentApi.apiUrl() + "request"
		const result = await axios.get(api, {
			headers: {
				"Authorization": processToken(tgToken)
			},
			params: request
		});
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data;
			} else {
				throw result.data.msg
			}
		} else {
			throw result.status
		}
	},

	confirmPayment: async (tgToken: string, paymentId: string) => {
		const api = PaymentApi.apiUrl() + "confirm"
		const formData = new FormData();
		formData.append("payment_id", paymentId);
		try {
			const result = await axios.post(api, formData, {
				headers: {
					"Authorization": processToken(tgToken)
				}
			});
			if (result.status == 200) {
				if (result.data.code == 0) {
					return result.data.data;
				} else {
					throw result.data.msg;
				}
			} else {
				throw result.status;
			}
		} catch (error: any) {
			if (error.response && error.response.data) {
				throw error.response.data.msg;
			} else {
				throw error;
			}
		}
	},

	getPayment: async (userId: string, gameId: string, paymentId: string) => {
		const api = PaymentApi.apiUrl() + "get"
		const result = await axios.get(api, {
			params: {
				user_id: userId,
				game_id: gameId,
				payment_id: paymentId
			}
		});
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data as PaymentData;
			} else {
				throw result.data.msg
			}
		} else {
			throw result.status
		}
	},
}

type RechargeOrder = {
	id: string,
	user_id: string,
	pay_from: string,
	payment_id: string,
	from: number,
	price: number,
	price_type: number,
	diamond: number,
	status: number,
}

const RechargeApi = {
	apiUrl: (): string => {
		return dashFunApiUrl + "recharge/"
	},

	getOptions: async (tgToken: string, platform: string) => {
		const api = RechargeApi.apiUrl() + "options"
		const result = await axios.get(api, {
			headers: {
				"Authorization": processToken(tgToken)
			},
			params: {
				platform
			}
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data;
			} else {
				return result.data.msg
			}
		} else {
			throw result.status
		}
	},

	requestOrder: async (tgToken: string, gameId: string, platform: string, optionIndex: number): Promise<RechargeOrder> => {
		const api = RechargeApi.apiUrl() + "order/create"
		const result = await axios.post(api, {
			platform, recharge_option_index: optionIndex, channel: currentChannel(), game_id: gameId
		}, {
			headers: {
				"Authorization": processToken(tgToken)
			},
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data as RechargeOrder;
			} else {
				return result.data.msg
			}
		} else {
			throw result.status
		}
	},

	cancelOrder: async (tgToken: string, orderId: string) => {
		const api = RechargeApi.apiUrl() + "order/cancel"
		const formData = new FormData();
		formData.append("id", orderId);
		const result = await axios.post(api, formData, {
			headers: {
				"Authorization": processToken(tgToken)
			},
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data;
			} else {
				return result.data.msg
			}
		} else {
			throw result.status
		}
	},

	getOrder: async (orderId: string): Promise<RechargeOrder> => {
		const api = RechargeApi.apiUrl() + "order/" + orderId
		const result = await axios.get(api)
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data;
			} else {
				return result.data.msg
			}
		}
		else {
			throw result.status
		}
	}
}

const TaskApi = {
	apiUrl: (): string => {
		return dashFunApiUrl + "task/"
	},

	getTaskList: async (tgToken: string, gameId: string) => {
		const api = TaskApi.apiUrl() + "list"
		const result = await axios.get(api, {
			headers: {
				"Authorization": processToken(tgToken)
			},
			params: {
				game_id: gameId
			}
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data;
			} else {
				return result.data.msg
			}
		} else {
			throw result.status
		}
	},

	onTaskClicked: async (tgToken: string, gameId: string, taskId: string) => {
		const api = TaskApi.apiUrl() + "clicked"
		const result = await axios.get(api, {
			headers: {
				"Authorization": processToken(tgToken)
			},
			params: {
				game_id: gameId,
				task_id: taskId,
			}
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data;
			} else {
				return result.data.msg
			}
		} else {
			throw result.status
		}
	},

	verifyTask: async (tgToken: string, gameId: string, taskId: string) => {
		const api = TaskApi.apiUrl() + "verify"
		const result = await axios.get(api, {
			headers: {
				"Authorization": processToken(tgToken)
			},
			params: {
				game_id: gameId,
				task_id: taskId,
			}
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data;
			} else {
				return result.data.msg
			}
		} else {
			throw result.status
		}
	},

	claimReward: async (tgToken: string, gameId: string, taskId: string) => {
		const api = TaskApi.apiUrl() + "claim"
		const result = await axios.get(api, {
			headers: {
				"Authorization": processToken(tgToken)
			},
			params: {
				game_id: gameId,
				task_id: taskId,
			}
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data;
			} else {
				return result.data.msg
			}
		} else {
			throw result.status
		}
	},

	/**
	 * 获取用于当前的任务状态数量
	 * @param tgToken 
	 * @param gameId 
	 * @returns 
	 */
	getCount: async (tgToken: string, gameId: string) => {
		const api = TaskApi.apiUrl() + "count"
		const result = await axios.get(api, {
			headers: {
				"Authorization": processToken(tgToken)
			},
			params: {
				game_id: gameId,
			}
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data;
			} else {
				return result.data.msg
			}
		} else {
			throw result.status
		}
	}
}

const CoinApi = {
	apiUrl: (): string => {
		return dashFunApiUrl + "coin/"
	},

	getCoins: async (tgToken: string) => {
		const api = CoinApi.apiUrl() + "get"
		const result = await axios.get(api, {
			headers: {
				"Authorization": processToken(tgToken)
			},
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data;
			} else {
				return result.data.msg
			}
		} else {
			throw result.status
		}
	},

	getCoinList: async (tgToken: string, coin_ids: string[], idType: "id" | "gameId") => {
		const api = CoinApi.apiUrl() + "list";
		const result = await axios.post(api, {
			ids: coin_ids,
			id_type: idType
		}, {
			headers: {
				"Authorization": processToken(tgToken)
			}
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data;
			} else {
				return result.data.msg
			}
		} else {
			throw result.status
		}
	},

	getCoinUserDataList: async (tgToken: string, coin_ids: string[], idType: "id" | "gameId") => {
		const api = CoinApi.apiUrl() + "user_data";
		const result = await axios.post(api, {
			ids: coin_ids,
			id_type: idType
		}, {
			headers: {
				"Authorization": processToken(tgToken)
			}
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data;
			} else {
				return result.data.msg
			}
		} else {
			throw result.status
		}
	}
}

const FriendsApi = {
	apiUrl(): string {
		return dashFunApiUrl + "friends/"
	},

	myFriends: async (tgToken: string) => {
		const api = FriendsApi.apiUrl() + "my"
		const result = await axios.get(api, {
			headers: {
				"Authorization": processToken(tgToken)
			},
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data;
			} else {
				return result.data.msg
			}
		} else {
			throw result.status
		}
	},
}

const LeaderBoardApi = {
	apiUrl(): string {
		return dashFunApiUrl + "leaderboard/"
	},

	xpTop: async (tgToken: string) => {
		const api = LeaderBoardApi.apiUrl() + "xp_top"
		const result = await axios.get(api, {
			headers: {
				"Authorization": processToken(tgToken)
			}
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data;
			} else {
				return result.data.msg
			}
		} else {
			throw result.status
		}
	},

	fpTop: async (tgToken: string) => {
		const api = LeaderBoardApi.apiUrl() + "fp_top"
		const result = await axios.get(api, {
			headers: {
				"Authorization": processToken(tgToken)
			}
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data;
			} else {
				return result.data.msg
			}
		} else {
			throw result.status
		}
	},

	ndpTop: async (tgToken: string) => {
		const api = LeaderBoardApi.apiUrl() + "ndp_top"
		const result = await axios.get(api, {
			headers: {
				"Authorization": processToken(tgToken)
			}
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data;
			} else {
				return result.data.msg
			}
		} else {
			throw result.status
		}
	},
}


const AirdropApi = {
	apiUrl: (): string => {
		return dashFunApiUrl + "airdrop/"
	},

	detail: async (tgToken: string): Promise<AirdropData> => {
		const api = AirdropApi.apiUrl() + "detail"
		const result = await axios.get(api, {
			headers: {
				"Authorization": processToken(tgToken)
			},
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data as AirdropData;
			} else {
				throw result.data.msg
			}
		} else {
			throw result.status
		}
	},

	claim: async (tgTGoken: string, address: string, kcUid: string): Promise<string> => {
		const api = AirdropApi.apiUrl() + "claim"
		const formData = new FormData();
		formData.append("address", address);
		formData.append("kc_uid", kcUid);
		try {
			const result = await axios.post(api, formData, {
				headers: {
					"Authorization": processToken(tgTGoken)
				}
			})
			if (result.status == 200) {
				if (result.data.code == 0) {
					return result.data.data;
				} else {
					throw result.data.msg
				}
			} else {
				throw result.data.msg
			}
		} catch (error: any) {
			if (error.response && error.response.data) {
				throw error.response.data.msg;
			} else {
				throw error;
			}
		}
	},

	myRequest: async (tgToken: string): Promise<AirdropVestingRequest> => {
		const api = AirdropApi.apiUrl() + "my_request"
		const result = await axios.get(api, {
			headers: {
				"Authorization": processToken(tgToken)
			},
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data as AirdropVestingRequest;
			} else {
				throw result.data.msg
			}
		} else {
			throw result.status
		}
	}
}


const SpinWheelApi = {
	apiUrl: (): string => {
		return dashFunApiUrl + "spinwheel/"
	},

	getInfo: async (tgToken: string): Promise<SpinWheelInfo> => {
		const api = SpinWheelApi.apiUrl() + "get"
		const result = await axios.get(api, {
			headers: {
				"Authorization": processToken(tgToken)
			},
			// params: {
			// 	game_id: gameId,
			// }
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data;
			} else {
				return result.data.msg;
			}
		} else {
			throw result.status
		}
	},

	spin: async (tgToken: string): Promise<SpinWheelInfo> => {
		const api = SpinWheelApi.apiUrl() + "spin"
		const result = await axios.get(api, {
			headers: {
				"Authorization": processToken(tgToken)
			},
			// params: {
			// 	game_id: gameId,
			// }
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data;
			} else {
				return result.data.msg;
			}
		} else {
			throw result.status
		}
	},

	claim: async (tgToken: string): Promise<SpinWheelInfo> => {
		const api = SpinWheelApi.apiUrl() + "claim"
		const result = await axios.get(api, {
			headers: {
				"Authorization": processToken(tgToken)
			},
			// params: {
			// 	game_id: gameId,
			// }
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data;
			} else {
				return result.data.msg;
			}
		} else {
			throw result.status
		}
	}

}

const FishingVerseApi = {

	apiUrl: (): string => {
		return dashFunApiUrl + "fishingverse/"
	},

	updateProfile: async (tgToken: string, profile: FishingVerseUserProfile, avatar: Blob): Promise<FishingVerseUserProfile> => {
		const api = FishingVerseApi.apiUrl() + "profile/update"
		const formData = new FormData();
		formData.append("nickname", profile.nickname);
		formData.append("avatar.png", avatar, "avatar.png");

		console.log("updateProfile formData:", avatar);

		const result = await axios.post(api, formData, {
			headers: {
				"Authorization": processToken(tgToken)
			},
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data;
			} else {
				throw result.data.msg
			}
		} else {
			throw result.status
		}
	},

	checkinRemaining: async (tgToken: string): Promise<number> => {
		const api = FishingVerseApi.apiUrl() + "remaining"
		const result = await axios.get(api, {
			headers: {
				"Authorization": processToken(tgToken)
			},
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data;
			} else {
				throw result.data.msg
			}
		} else {
			throw result.status
		}
	},
	post: async (tgToken: string, post: string, location: string, fish: string): Promise<string> => {
		const api = FishingVerseApi.apiUrl() + "post"
		const formData = new FormData();
		formData.append("post", post);
		formData.append("location", location);
		formData.append("fish", fish);

		const result = await axios.post(api, formData, {
			headers: {
				"Authorization": processToken(tgToken)
			},
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data;
			} else {
				throw result.data.msg
			}
		} else {
			throw result.status
		}
	},
	getPosts: async (tgToken: string, limit = 50): Promise<FishingPostData[]> => {
		const api = FishingVerseApi.apiUrl() + "posts"
		const result = await axios.get(api, {
			headers: {
				"Authorization": processToken(tgToken)
			},
			params: {
				limit
			}
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data;
			} else {
				throw result.data.msg
			}
		} else {
			throw result.status
		}
	}
}

const NolanDevApi = {

	apiUrl: (): string => {
		return dashFunApiUrl + "nolan/"
	},

	updateProfile: async (tgToken: string, profile: FishingVerseUserProfile, avatar: Blob): Promise<FishingVerseUserProfile> => {
		const api = FishingVerseApi.apiUrl() + "profile/update"
		const formData = new FormData();
		formData.append("nickname", profile.nickname);
		formData.append("avatar.png", avatar, "avatar.png");

		console.log("updateProfile formData:", avatar);

		const result = await axios.post(api, formData, {
			headers: {
				"Authorization": processToken(tgToken)
			},
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data;
			} else {
				throw result.data.msg
			}
		} else {
			throw result.status
		}
	},

	checkinRemaining: async (tgToken: string): Promise<number> => {
		const api = NolanDevApi.apiUrl() + "remaining"
		const result = await axios.get(api, {
			headers: {
				"Authorization": processToken(tgToken)
			},
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data;
			} else {
				throw result.data.msg
			}
		} else {
			throw result.status
		}
	},
	post: async (tgToken: string, post: string, location: string, fish: string): Promise<string> => {
		const api = NolanDevApi.apiUrl() + "post"
		const formData = new FormData();
		formData.append("post", post);
		formData.append("location", location);
		formData.append("fish", fish);

		const result = await axios.post(api, formData, {
			headers: {
				"Authorization": processToken(tgToken)
			},
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data;
			} else {
				throw result.data.msg
			}
		} else {
			throw result.status
		}
	},
	getPosts: async (tgToken: string, limit = 50): Promise<FishingPostData[]> => {
		const api = NolanDevApi.apiUrl() + "posts"
		const result = await axios.get(api, {
			headers: {
				"Authorization": processToken(tgToken)
			},
			params: {
				limit
			}
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data;
			} else {
				throw result.data.msg
			}
		} else {
			throw result.status
		}
	}
}

const MarketsApi = {
	apiUrl: (): string => {
		return dashFunApiUrl + "markets/"
	},

	get: async (tgToken: string, tokens: string[]): Promise<TokenMarketInfo[]> => {
		const api = MarketsApi.apiUrl() + "get"
		const result = await axios.get(api, {
			headers: {
				"Authorization": processToken(tgToken)
			},
			params: {
				ids: tokens
			}
		})
		if (result.status == 200) {
			if (result.data.code == 0) {
				return result.data.data;
			} else {
				throw result.data.msg
			}
		} else {
			throw result.status
		}
	},

	forecast: async (tgToken: string, symbol: string): Promise<ForecastPoint[]> => {
		const api = MarketsApi.apiUrl() + `forecast/${symbol}`
		const result = await axios.get(api, {
			headers: {
				"Authorization": processToken(tgToken)
			}
		})
		if (result.status == 200) {
			const forecastResp = result.data as ForecastResponse;
			return forecastResp.data;
		} else {
			throw result.status
		}
	}
}

const tg_link = () => {
	let botName = "DashFunBot";

	if (isInTelegram()) {
		switch (env) {
			case Env.Test:
				botName = "DashFunTestBot";
				break;
			case Env.Dev:
				botName = "LocalTestBot";
				break;
			case Env.Prod:
				botName = "DashFunBot";
				break;
		}
		return `https://t.me/${botName}`
	} else {
		//环境外不需要bot name，但是为了openTelegramLink的统一性，必须返回https://t.me
		return "https://t.me";
	}
}

const TGLink = {
	gameLink: (gameId: string) => {
		if (isInTelegram()) {
			return `${tg_link()}/Games?startapp=${gameId}`
		} else {
			return `${tg_link()}/game?game_id=${gameId}`
		}
	},
	centerLink: (userId?: string) => {
		if (isInTelegram()) {
			return userId == null || userId == "" ? `${tg_link()}/Center` : `${tg_link()}/Center?startapp=${userId}`
		} else {
			return userId == null || userId == "" ? `https://app.dashfun.games/game-center` : `https://app.dashfun.games/game-center?r=${userId}`
		}
	},
	botLink: () => {
		return `${tg_link()}`
	},
	groupLink: () => {
		let link = "";
		switch (env) {
			case Env.Test:
				link = "https://t.me/+h79TJSlUaO03ZDdh"
				break;
			case Env.Dev:
				link = "https://t.me/dashfun_official";
				break;
			case Env.Prod:
				link = "https://t.me/dashfun_official";
				break;
		}
		return link
	}
}

const RechargeLink = {
	host: () => {
		let link = "";
		switch (env) {
			case Env.Dev:
				link = "http://localhost:5175"
				break;
			case Env.Test:
				link = "https://wallet-test.dashfun.games"
				break;
			case Env.Prod:
				link = "https://wallet.dashfun.games"
				break;
		}
		return link;
	},

	orderLink: (orderId: string) => {
		return `${RechargeLink.host()}/recharge/${orderId}`
	}
}

const getEnv = () => {
	return env
}


export { AccountType, AccountStatus, AccApi, AirdropApi, GameApi, PaymentApi, RechargeApi, UserApi, TGLink, TaskApi, CoinApi, SpinWheelApi, LeaderBoardApi, FriendsApi, RechargeLink, FishingVerseApi, NolanDevApi, MarketsApi, getEnv, Env }
export type { PaymentData, RechargeOrder, DashFunAccount, AirdropData, AirdropVestingRequest, TokenMarketInfo }