import { Coin, FishingVerseUserProfile, RechargePriceType, RechargePriceTypeText } from "@/constats";
import { PaymentData } from "@/utils/DashFunApi";
import { GameData } from "../DashFunData/GameData";
import { DashFunUser } from "../DashFunData/UserData";

const EventTypes = {
	Unloading: 0,
	GameLoading: 1,
	TaskStatusChanged: 50,
	CoinChanged: 100,
	SpinWheelStatusChanged: 150,
	OpenDashFunPayment: 200,
	OpenDashFunRecharge: 250,

	UserLogin: 1001,
	GameDataLoaded: 1002,
	UserEnterGame: 1003,
	UserPayment: 1004,
	UserRecharge: 1005,
	UserActived: 1006,
	UserXpReached5k: 1007,

	UserProfileUpdated: 1008,
}


const EvtListeners: { [key: number]: ((p: any[]) => void)[] } = {};

/**
 * 
 * @param {EventTypes} evtType 
 * @returns {function(p:any):void[]}
 */
const getEvtListeners = (evtType: number): ((...p: any[]) => void)[] => {
	if (EvtListeners[evtType] == null) {
		EvtListeners[evtType] = [];
	}
	return EvtListeners[evtType];
}

class EventBase {
	#evtType: number;

	constructor(type: number) {
		this.#evtType = type;
	}

	addListener(listener: ((...p: any[]) => void)) {
		const listeners = getEvtListeners(this.#evtType);
		listeners.push(listener)
	}

	removeListener(listener: ((...p: any[]) => void)) {
		const listeners = getEvtListeners(this.#evtType);
		const idx = listeners.indexOf(listener);
		if (idx > 0) {
			listeners.splice(idx, 1);
		}
	}

	fire(...args: any[]) {
		const listeners = getEvtListeners(this.#evtType);
		listeners.forEach(l => {
			l(...args);
		})
	}
}

class GameLoadingEvents extends EventBase {
	constructor() {
		super(EventTypes.GameLoading);
	}

	/**
	 * @overload
	 * @param listener 
	 */
	addListener(listener: ((value: number) => void)): void {
		super.addListener(listener);
	}

	/**
	 * 
	 * @param value range(0-100)
	 */
	fire(value: number): void {
		super.fire(value)
	}
}

class TaskStatusChangedEvents extends EventBase {
	constructor() {
		super(EventTypes.TaskStatusChanged);
	}

	/**
	 * @overload
	 * @param listener 
	 */
	addListener(listener: ((taskId: string, status: number) => void)): void {
		super.addListener(listener);
	}

	/**
	 * 
	 * @param value range(0-100)
	 */
	fire(taskId: string, status: number): void {
		console.log("fire task status changed event", taskId, status)
		super.fire(taskId, status)
	}

}

class SpinWheelStatusChangedEvents extends EventBase {
	constructor() {
		super(EventTypes.SpinWheelStatusChanged);
	}

	/**
	 * @overload
	 * @param listener 
	 */
	addListener(listener: ((spinwheelId: string, status: number) => void)): void {
		super.addListener(listener);
	}

	/**
	 * 
	 * @param value range(0-100)
	 */
	fire(spinwheelId: string, status: number): void {
		console.log("fire spinwheelId status changed event", spinwheelId, status)
		super.fire(spinwheelId, status)
	}

}

class CoinChangedEvents extends EventBase {
	constructor() {
		super(EventTypes.CoinChanged);
	}

	/**
	 * @overload
	 * @param listener 
	 */
	addListener(listener: (coin: Coin, changed: number) => void): void {
		super.addListener(listener);
	}

	/**
	 * 
	 * @param changed 变化数量,>0增加，<0减少
	 */
	fire(coin: Coin, changed: number): void {
		super.fire(coin, changed)
	}
}

class OpenDashFunPaymentEvents extends EventBase {
	constructor() {
		super(EventTypes.OpenDashFunPayment);
	}

	addListener(listener: (paymentId: string, onResult: (success: boolean, msg: string) => void) => void): void {
		super.addListener(listener);
	}

	fire(paymentId: string, onResult: (success: boolean, msg: string) => void): void {
		super.fire(paymentId, onResult)
	}
}

class OpenDashFunRechargeEvents extends EventBase {
	constructor() {
		super(EventTypes.OpenDashFunRecharge);
	}

	addListener(listener: (minRechargeValue: number) => void): void {
		super.addListener(listener);
	}

	fire(minRechargeValue: number): void {
		super.fire(minRechargeValue)
	}
}

class UserLoginEvents extends EventBase {
	constructor() {
		super(EventTypes.UserLogin);
	}

	addListener(listener: (user: DashFunUser) => void): void {
		super.addListener(listener);
	}

	fire(user: DashFunUser): void {
		super.fire(user)
	}
}

class UserXpReached5kEvents extends EventBase {
	constructor() {
		super(EventTypes.UserXpReached5k);
	}

	addListener(listener: (userId: string) => void): void {
		super.addListener(listener);
	}

	fire(userId: string): void {
		super.fire(userId)
	}
}

class UserActivedEvents extends EventBase {
	constructor() {
		super(EventTypes.UserActived);
	}

	addListener(listener: (userId: string) => void): void {
		super.addListener(listener);
	}

	fire(userId: string): void {
		super.fire(userId)
	}
}

class GameDataLoadedEvents extends EventBase {
	constructor() {
		super(EventTypes.GameDataLoaded);
	}

	addListener(listener: (game: GameData) => void): void {
		super.addListener(listener);
	}

	fire(game: GameData): void {
		super.fire(game)
	}
}


const GameLoadingEvent = new GameLoadingEvents();
const CoinChangedEvent = new CoinChangedEvents();
const TaskStatusChangedEvent = new TaskStatusChangedEvents();
const SpinWheelStatusChangedEvent = new SpinWheelStatusChangedEvents();
const OpenDashFunPaymentEvent = new OpenDashFunPaymentEvents();
const OpenDashFunRechargeEvent = new OpenDashFunRechargeEvents();


class UserEnterGameEvents extends EventBase {
	constructor() {
		super(EventTypes.UserEnterGame);
	}

	addListener(listener: (game: GameData) => void): void {
		super.addListener(listener);
	}

	fire(game: GameData): void {
		super.fire(game);
	}
}

class UserPaymentEvents extends EventBase {
	constructor() {
		super(EventTypes.UserPayment);
	}

	addListener(listener: (payment: PaymentData, status: "pending" | "success" | "canceled") => void): void {
		super.addListener(listener);
	}

	fire(payment: PaymentData, status: "pending" | "success" | "canceled"): void {
		super.fire(payment, status)
	}
}

class TopupItem {
	itemName: string;
	itemAmount: number;
	itemPrice: number;
	itemCurrency: string;
	constructor(itemName: string, itemAmount: number, itemPrice: number, itemCurrency: string) {
		this.itemName = itemName;
		this.itemAmount = itemAmount;
		this.itemPrice = itemPrice;
		this.itemCurrency = itemCurrency;

		if (this.itemCurrency == RechargePriceTypeText[RechargePriceType.TGSTAR]) {
			this.itemCurrency = RechargePriceTypeText[RechargePriceType.USD]; // TG Star按照50 Stars = 1 USD换算
			this.itemPrice = Math.round((this.itemPrice / 50.0) * 100) / 100;
		}
	}

	/**
	 * Firebase 上报价格是以元为单位
	 * @returns {number} 价格单位是美元
	 */
	getPrice() {
		return this.itemPrice / 100;
	}

	toFirebaseItem(affiliation: string = "DashFun") {
		return {
			item_name: this.itemAmount + " " + this.itemName,
			price: this.getPrice(),
			quantity: 1,
			affiliation
		}
	}
}

class UserRechargeEvents extends EventBase {
	constructor() {
		super(EventTypes.UserRecharge);
	}

	addListener(listener: (orderId: string, status: "pending" | "success" | "canceled", payFrom: string, item: TopupItem) => void): void {
		super.addListener(listener);
	}

	fire(orderId: string, status: "pending" | "success" | "canceled", payFrom: string, item: TopupItem): void {
		super.fire(orderId, status, payFrom, item);
	}
}


class UnloadingEvents extends EventBase {
	constructor() {
		super(EventTypes.Unloading);
	}
	addListener(listener: () => void): void {
		super.addListener(listener);
	}
	fire(): void {
		super.fire();
	}
}

class UserProfileUpdatedEvents extends EventBase {
	constructor() {
		super(EventTypes.UserProfileUpdated);
	}

	addListener(listener: (profile: FishingVerseUserProfile) => void): void {
		super.addListener(listener);
	}

	fire(profile: FishingVerseUserProfile): void {
		super.fire(profile);
	}
}


//game events
const UserLoginEvent = new UserLoginEvents();
const UserActivedEvent = new UserActivedEvents();
const GameDataLoadedEvent = new GameDataLoadedEvents();
const UserEnterGameEvent = new UserEnterGameEvents();
const UserPaymentEvent = new UserPaymentEvents();
const UserRechargeEvent = new UserRechargeEvents();
const UserXpReached5kEvent = new UserXpReached5kEvents();

const UserProfileUpdatedEvent = new UserProfileUpdatedEvents();


const UnloadingEvent = new UnloadingEvents();

export { CoinChangedEvent, GameDataLoadedEvent, GameLoadingEvent, OpenDashFunPaymentEvent, OpenDashFunRechargeEvent, SpinWheelStatusChangedEvent, TaskStatusChangedEvent, TopupItem, UnloadingEvent, UserActivedEvent, UserEnterGameEvent, UserLoginEvent, UserPaymentEvent, UserRechargeEvent, UserXpReached5kEvent, UserProfileUpdatedEvent };
