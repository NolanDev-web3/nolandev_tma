import { Env, getEnv, PaymentApi } from "@/utils/DashFunApi";
import {
	initData,
	invoice,
	openTelegramLink,
	useSignal
} from "@telegram-apps/sdk-react";
import { FC, useEffect, useRef } from "react";
import { useDashFunGame } from "../DashFun/DashFunGame";
import { useDashFunUser } from "../DashFun/DashFunUser";
import { GameData } from "../DashFunData/GameData";
import { DashFunUser } from "../DashFunData/UserData";
import { GameLoadingEvent, OpenDashFunPaymentEvent, UnloadingEvent } from "../Event/Events";
import { DashFunMessages } from "./Messages";
import { createLogger } from "@/utils/createLogger";
import { isInTelegram } from "@/utils/Utils";

class Context {
	callData: any;
	dfUser: DashFunUser;
	initDataRaw: string;
	source: Window;
	dfGame: GameData;

	constructor(source: Window, callData: any, dfGame: GameData, dfUser: DashFunUser, initDataRaw: string) {
		this.dfUser = dfUser;
		this.callData = callData;
		this.initDataRaw = initDataRaw;
		this.source = source;
		this.dfGame = dfGame;
	}
}

class Result {
	state: "success" | "error"
	data: any

	constructor(state: "success" | "error", data: any) {
		this.state = state;
		this.data = data;
	}
}

const sendResult = (source: Window, method: string, result: Result) => {
	const payload = {
		dashfun: {
			method: method + "Result",
			result: result,
		}
	}
	logInfo(false, "Sending Result", payload.dashfun)
	source.postMessage(payload, "*")
}

const onGetUserProfile = (ctx: Context) => {
	const { method } = ctx.callData;
	sendResult(ctx.source, method, new Result("success", ctx.dfUser))
}

const onOpenTelegramLink = (ctx: Context) => {
	const { value } = ctx.callData.payload;
	openTelegramLink(value);
}

const onOpenInvoice = (ctx: Context) => {
	const { method, payload } = ctx.callData;
	const { paymentId } = payload;

	// if (invoiceLink.startsWith("test-")) {
	// 	sendResult(ctx.source, method, new Result("success", { paymentId, status: "paid" }))
	// } else {
	// 	console.log("opening invoice", invoiceLink)
	// 	invoice.open(invoiceLink, "url").then((status) => {
	// 		console.log(`invoice ${invoiceLink} status changed:`, status);
	// 		sendResult(ctx.source, method, new Result("success", { paymentId, status }))
	// 	}).catch(e => {
	// 		console.error(e);
	// 	});
	// }

	//open dashfun payment
	const onResult = (success: boolean, msg: string) => {
		sendResult(ctx.source, method, new Result(success ? "success" : "error", { paymentId, status: success ? "paid" : "error", msg }))
	}

	OpenDashFunPaymentEvent.fire(paymentId, onResult);

}

const onRequestAd = (ctx: Context) => {
	const { method, payload } = ctx.callData
	const { title, desc } = payload

	if (isInTelegram()) {
		PaymentApi.requestTGPayment(ctx.initDataRaw, {
			game_id: ctx.dfGame.id,
			title,
			desc: desc == null || desc == "" ? " " : desc,
			payload: "ad",
			price: 1, //所有广告都按扣1星星处理
		}).then(result => {
			const { invoiceLink } = result;
			if (invoiceLink) {
				if (invoiceLink.startsWith("test-")) {
					sendResult(ctx.source, method, new Result("success", { data: "success" }))
				} else {
					console.log("opening invoice", invoiceLink)
					invoice.open(invoiceLink, "url").then((status) => {
						console.log(`invoice ${invoiceLink} status changed:`, status);
						sendResult(ctx.source, method, new Result("success", { data: status == "paid" ? "success" : status }))
					}).catch(e => {
						console.error(e);
						sendResult(ctx.source, method, new Result("error", { data: "error" }))
					});
				}
			} else {
				const r = new Result("error", { data: "canceled" });
				sendResult(ctx.source, method, r)
			}

		}).catch(e => {
			console.error(e);
			const r = new Result("error", e);
			sendResult(ctx.source, method, r)
		})
	} else {
		//web环境下，目前扣1个diamond
		PaymentApi.requestPayment(ctx.initDataRaw, {
			game_id: ctx.dfGame.id,
			title,
			desc: desc == null || desc == "" ? " " : desc,
			payload: "ad",
			price: 1, //1 diamond
		}).then(result => {

			//open dashfun payment
			const onResult = (success: boolean, msg: string) => {
				sendResult(ctx.source, method, new Result(success ? "success" : "error", { paymentId, status: success ? "paid" : "error", msg }))
			}
			const { paymentId } = result;
			OpenDashFunPaymentEvent.fire(paymentId, onResult);
		}).catch(e => {
			console.error(e);
			const r = new Result("error", e);
			sendResult(ctx.source, method, r)
		}
		)
	}

}

const onRequestPayment = (ctx: Context) => {
	const { method, payload } = ctx.callData
	const { title, desc, info, price } = payload
	PaymentApi.requestPayment(ctx.initDataRaw, {
		game_id: ctx.dfGame.id,
		title,
		desc,
		payload: info,
		price
	}).then(result => {
		const r = new Result("success", result);
		sendResult(ctx.source, method, r)
	}).catch(e => {
		console.error(e);
		const r = new Result("error", e);
		sendResult(ctx.source, method, r)
	})
}

const onSetData = (_: Context) => {
}

const onGetData = (_: Context) => {
}

const onGetDataV2 = (_: Context) => {
}

const onLoading = (ctx: Context) => {
	const { payload } = ctx.callData
	let { value } = payload;

	if (value == null) {
		value = 0
	}
	GameLoadingEvent.fire(value);
}


const processors: { [key: string]: (ctx: Context) => void } = {};
processors[DashFunMessages.getUserProfile] = onGetUserProfile;
processors[DashFunMessages.openTelegramLink] = onOpenTelegramLink;
processors[DashFunMessages.openInvoice] = onOpenInvoice;
processors[DashFunMessages.requestPayment] = onRequestPayment;
processors[DashFunMessages.requestAd] = onRequestAd;
processors[DashFunMessages.loading] = onLoading;
processors[DashFunMessages.getData] = onGetData;
processors[DashFunMessages.getDataV2] = onGetDataV2;
processors[DashFunMessages.setData] = onSetData;

const [logInfo] = createLogger("DF-Message", {
	bgColor: '#228888',
	textColor: 'white',
	shouldLog() {
		return getEnv() != Env.Prod;
	}
})

export const MessageListener: FC = () => {
	const initDataRaw = useSignal(initData.raw)
	const dfUser = useDashFunUser();
	const game = useDashFunGame();

	const userRef = useRef(dfUser);
	const gameRef = useRef(game);
	const initDataRef = useRef(initDataRaw);

	useEffect(() => {
		userRef.current = dfUser;
		gameRef.current = game;
		initDataRef.current = initDataRaw;
	}, [dfUser, game, initDataRaw]);


	useEffect(() => {
		const eventListener = (ev: MessageEvent<any>) => {
			console.log("receive message", ev);
			const { data } = ev;
			if (data.dashfun) {
				const { method } = data.dashfun;
				const f = processors[method];
				if (f != null) {
					logInfo(false, "Processing Message", method, data.dashfun)
					const context = new Context(
						ev.source as Window,
						data.dashfun,
						gameRef.current as GameData,
						userRef.current as DashFunUser,
						initDataRef.current as string,
					)
					f(context);
				}
			}
		}

		const unloadLitener = (ev: BeforeUnloadEvent) => {
			UnloadingEvent.fire();
			if (!isInTelegram()) {
				ev.preventDefault();
				ev.returnValue = "";
			}
		}

		const l = eventListener
		window.addEventListener('message', l)

		window.addEventListener('beforeunload', unloadLitener);

		return () => {
			window.removeEventListener('message', l);
		}
	}, [])

	return <div id="message listener"></div>
}