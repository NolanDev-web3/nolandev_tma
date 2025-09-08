import { retrieveLaunchParams } from "@telegram-apps/sdk-react";
import { getEnv } from "./DashFunApi";

export const convertMilliseconds = (milliseconds: number) => {
	const seconds = Math.floor(milliseconds / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	return {
		days,
		hours: hours % 24,
		minutes: minutes % 60,
		seconds: seconds % 60,
	};
};

export const toTimeString = (days: number, hours: number, minutes: number, seconds: number) => {
	let ret = "";
	if (days > 1) {
		ret += days + " days "
	} else if (days == 1) {
		ret += days + " day "
	}
	ret += `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
	return ret;
}

export const isPcBrowser = () => {
	return !/Mobi|Android/i.test(navigator.userAgent);
};

const telegramPlatforms = ["tdesktop", "android", "ios", "macos", "web"]

const openReachargeInApp = true;

export const isRechargeOpen = () => {
	if (isInDashFunApp() != null) {
		return openReachargeInApp;
	} else {
		return true;
	}
}

/**
 * 判断当前是否在DashFun应用中(Mobile App)
 * @returns {string} 返回平台 ios | android | null，null表示不在DashFun应用中
 */
export const isInDashFunApp = (): "ios" | "android" | null => {
	return window.dashfun_app;
}

export const isInTelegram = () => {
	const platform = retrieveLaunchParams().platform;
	return telegramPlatforms.includes(platform);
}

export const channelSaveKey = () => {
	return "DashFun-LoginChannel-" + getEnv();
}

export const orderSaveKey = (userId: string) => {
	return "DashFun-Order-" + userId;
}

export const currentChannel = () => {
	const saved = localStorage.getItem(channelSaveKey());
	if (saved != null) {
		return saved;
	} else {
		if (isInTelegram()) {
			return "tg";
		} else {
			return "web";
		}
	}
}

export const isInGameCenter = () => {
	return window.location.href.includes("game-center");
}

export const sleep = (ms: number): Promise<void> => {
	return new Promise(resolve => setTimeout(resolve, ms));
}
