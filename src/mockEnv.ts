import { isTMA, mockTelegramEnv, parseInitData } from '@telegram-apps/sdk-react';
import { v4 as uuidv4 } from "uuid";
import { AccountType, Env, getEnv } from './utils/DashFunApi';

// It is important, to mock the environment only for development purposes. When building the
// application, import.meta.env.DEV will become false, and the code inside will be tree-shaken,
// so you will not see it in your final bundle.
if (import.meta.env.DEV) {
	(() => {
		let shouldMock;
		const MOCK_KEY = '____mocked';

		// We don't mock if we are already in a mini app.
		if (isTMA('simple')) {
			// We could previously mock the environment.
			// In case we did, we should do it again.
			// The reason is the page could be reloaded, and we should apply mock again, because
			// mocking also enables modifying the window object.
			shouldMock = !!sessionStorage.getItem(MOCK_KEY);
		} else {
			shouldMock = true;
		}

		if (!shouldMock) {
			return;
		}

		// const initDataRaw = new URLSearchParams([
		// 	['user', JSON.stringify({
		// 		id: 99281932,
		// 		first_name: 'Andrew',
		// 		last_name: 'Rogue',
		// 		username: 'rogue',
		// 		language_code: 'en',
		// 		is_premium: true,
		// 		allows_write_to_pm: true,
		// 	})],
		// 	['hash', '89d6079ad6762351f38c6dbbc41bb53048019256a9443988af7a48bcad16ba31'],
		// 	['auth_date', '1716922846'],
		// 	['start_param', 'debug'],
		// 	['chat_type', 'sender'],
		// 	['chat_instance', '8428209589180549439'],
		// ]).toString();


		const initDataRaw = getEnv() == Env.Dev ? "query_id=AAGuFCQDAQAAAK4UJAPHYlhd&user=%7B%22id%22%3A2200179886%2C%22first_name%22%3A%22Marco%22%2C%22last_name%22%3A%22Test%22%2C%22username%22%3A%22Marco_web3%22%2C%22language_code%22%3A%22en%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Fa-ttgme.stel.com%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2FUyoEyL4xrB_4jYbtDAKsRlU3-VHl9vlJ_ESwtdo9ztBcHXdXsAzLHk1biir38TJ-.svg%22%7D&auth_date=1738643830&signature=b9BaT5t8w5bR4b0S509qY1VIsmk20aymkhP2CfRv-r7M-G4Injb0iELE4licSA9F-nFaYPYkFFZQl-3IPf4jDg&hash=031c3c0040a6d79f979fab7c4c1db26fa7f67c9edc012fdfabcc64b8a14012e3"
			: "query_id=AAGdRiMDAQAAAJ1GIwP8XZGl&user=%7B%22id%22%3A2200127133%2C%22first_name%22%3A%22DashFun%22%2C%22last_name%22%3A%22Test%22%2C%22username%22%3A%22MarcoTest1%22%2C%22language_code%22%3A%22en%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Fa-ttgme.stel.com%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2F_UkdJAKrHgrVAVEg7reGeAtTtgNXStMmUSPq3W9C5WL6VBIe1b9bpZa5VRORCYWK.svg%22%7D&auth_date=1739304257&signature=jBwBAZTVg4EBllIS2sCgLyn-QjIWqi5pFGCzEvsM6kjGnarRYNX8UUrYzv77cY0GM3TwMTya3fpwMWgLu4YxDQ&hash=2e3cb51c74b3ebbc85fcc8d1010234e86c272f543cc0e3002a8b743824029e40";
		const initData = parseInitData(initDataRaw);
		mockTelegramEnv({
			themeParams: {
				accentTextColor: '#3e88f7',
				bgColor: '#222222',
				buttonColor: '#3e88f7',
				buttonTextColor: '#ffffff',
				destructiveTextColor: '#eb5545',
				headerBgColor: '#1a1a1a',
				hintColor: '#98989e',
				linkColor: '#3e88f7',
				secondaryBgColor: '#1c1c1d',
				sectionBgColor: '#2c2c2c',
				sectionHeaderTextColor: '#8d8e93',
				subtitleTextColor: '#98989e',
				textColor: '#ffffff',
			},
			initData: initData,
			initDataRaw,
			version: '8',
			platform: 'tdesktop',
		});
		sessionStorage.setItem(MOCK_KEY, '1');

		console.info(
			'⚠️ As long as the current environment was not considered as the Telegram-based one, it was mocked. Take a note, that you should not do it in production and current behavior is only specific to the development process. Environment mocking is also applied only in development mode. So, after building the application, you will not see this behavior and related warning, leading to crashing the application outside Telegram.',
		);
	})();
}

const getQueryParams = (): { [key: string]: string } => {
	const params = new URLSearchParams(window.location.search);
	const queryParams: { [key: string]: string } = {};

	params.forEach((value, key) => {
		queryParams[key] = value;
	});

	return queryParams;
};

const makeTestTgEnv = () => {
	let userStr = localStorage.getItem("DashFun-TestUser")
	let user = null;
	if (userStr == null) {
		const uid = uuidv4();
		const randomPart = Math.floor(1000 + Math.random() * 9000).toString();
		const milliseconds = new Date().getMilliseconds().toString().padStart(3, '0');
		const generatedId = `999${randomPart}${milliseconds}`;

		user = {
			userId: uid,
			tgUser: {
				id: generatedId,
				firstName: "Test",
				lastName: uid.slice(-4),
				username: "Test-" + uid.slice(-4),
				languageCode: "en",
				allowsWriteToPm: true,
				photoUrl: "",
			}
		}
		userStr = JSON.stringify(user);
		localStorage.setItem("DashFun-TestUser", userStr);
	} else {
		user = JSON.parse(userStr);
	}

	const params = getQueryParams();
	let startParam = ""
	if (params["game_id"] != null) {
		startParam = "&start_param=" + params["game_id"];
	}

	const initDataRaw = `query_id=AAGdRiMDAQAAAJ1GIwP8XZGl${startParam}&user=%7B%22id%22%3A${parseInt(user.tgUser.id, 10)}%2C%22first_name%22%3A%22${user.tgUser.firstName}%22%2C%22last_name%22%3A%22${user.tgUser.lastName}%22%2C%22username%22%3A%22${user.tgUser.username}%22%2C%22language_code%22%3A%22en%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Fa-ttgme.stel.com%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2F_UkdJAKrHgrVAVEg7reGeAtTtgNXStMmUSPq3W9C5WL6VBIe1b9bpZa5VRORCYWK.svg%22%7D&auth_date=${Math.floor(new Date().getTime() / 1000)}&signature=jBwBAZTVg4EBllIS2sCgLyn-QjIWqi5pFGCzEvsM6kjGnarRYNX8UUrYzv77cY0GM3TwMTya3fpwMWgLu4YxDQ&hash=2e3cb51c74b3ebbc85fcc8d1010234e86c272f543cc0e3002a8b743824029e40`;

	const initData = parseInitData(initDataRaw);
	mockTelegramEnv({
		themeParams: {
			accentTextColor: '#3e88f7',
			bgColor: '#222222',
			buttonColor: '#3e88f7',
			buttonTextColor: '#ffffff',
			destructiveTextColor: '#eb5545',
			headerBgColor: '#1a1a1a',
			hintColor: '#98989e',
			linkColor: '#3e88f7',
			secondaryBgColor: '#1c1c1d',
			sectionBgColor: '#2c2c2c',
			sectionHeaderTextColor: '#8d8e93',
			subtitleTextColor: '#98989e',
			textColor: '#ffffff',
		},

		initData: initData,
		initDataRaw,
		version: '8',
		platform: 'browser',
	});
}

// const makeBrowserEnv = () => {
// 	mockTelegramEnv({
// 		themeParams: {
// 			accentTextColor: '#3e88f7',
// 			bgColor: '#222222',
// 			buttonColor: '#3e88f7',
// 			buttonTextColor: '#ffffff',
// 			destructiveTextColor: '#eb5545',
// 			headerBgColor: '#1a1a1a',
// 			hintColor: '#98989e',
// 			linkColor: '#3e88f7',
// 			secondaryBgColor: '#1c1c1d',
// 			sectionBgColor: '#2c2c2c',
// 			sectionHeaderTextColor: '#8d8e93',
// 			subtitleTextColor: '#98989e',
// 			textColor: '#ffffff',
// 		},
// 		initDataRaw: "",
// 		version: '8',
// 		platform: 'browser',
// 	});
// }
const base36ToDecimal = (base36: string): number => {
	const base36Chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	return base36.split('').reverse().reduce((acc, char, index) => {
		const value = base36Chars.indexOf(char.toUpperCase());
		if (value === -1) {
			throw new Error(`Invalid character '${char}' in base32 string.`);
		}
		return acc + value * Math.pow(36, index);
	}, 0);
};

const makeBrowserEnv = (accountId: string, username: string, displayName: string, accType: AccountType, auth_date: string, hash: string) => {
	let initDataRaw = "";
	let initData = undefined;


	const accountIdDecimal = base36ToDecimal(accountId.substring(2));

	if (accountId != null && accountId != "") {
		const params = getQueryParams();
		let startParam = ""
		if (params["game_id"] != null) {
			startParam = "&start_param=" + params["game_id"];
		}
		const encodedDisplayName = encodeURIComponent(displayName);
		initDataRaw = `query_id=AAGdRiMDAQAAAJ1GIwP8XZGl${startParam}&user=%7B%22id%22%3A%22${accountIdDecimal}%22%2C%22acc_id%22%3A%22${accountId}%22%2C%22type%22%3A%22${accType}%22%2C%22display_name%22%3A%22${encodedDisplayName}%22%2C%22first_name%22%3A%22${""}%22%2C%22last_name%22%3A%22${""}%22%2C%22username%22%3A%22${username}%22%2C%22language_code%22%3A%22en%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22%22%7D&auth_date=${auth_date}&signature=&hash=${hash}`;
		initData = parseInitData(initDataRaw);
	}

	mockTelegramEnv({
		themeParams: {
			accentTextColor: '#3e88f7',
			bgColor: '#222222',
			buttonColor: '#3e88f7',
			buttonTextColor: '#ffffff',
			destructiveTextColor: '#eb5545',
			headerBgColor: '#1a1a1a',
			hintColor: '#98989e',
			linkColor: '#3e88f7',
			secondaryBgColor: '#1c1c1d',
			sectionBgColor: '#2c2c2c',
			sectionHeaderTextColor: '#8d8e93',
			subtitleTextColor: '#98989e',
			textColor: '#ffffff',
		},

		initData: initData,
		initDataRaw,
		version: '8',
		platform: 'browser',
	});
}


// const makeTelegramWebEnv = (user: TelegramUser | null) => {
// 	let initDataRaw = "";
// 	let initData = undefined;



// 	if (user != null) {
// 		const params = getQueryParams();
// 		let startParam = ""
// 		if (params["game_id"] != null) {
// 			startParam = "&start_param=" + params["game_id"];
// 		}
// 		initDataRaw = `query_id=AAGdRiMDAQAAAJ1GIwP8XZGl${startParam}&user=%7B%22id%22%3A%22${user.id}%22%2C%22type%22%3A%22${AccountType.Telegram}%22%2C%22first_name%22%3A%22${user.first_name}%22%2C%22last_name%22%3A%22${user.last_name}%22%2C%22username%22%3A%22${user.username}%22%2C%22language_code%22%3A%22en%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22${user.photo_url}%22%7D&auth_date=${user.auth_date}&signature=&hash=${user.hash}`;
// 		initData = parseInitData(initDataRaw);
// 	}

// 	mockTelegramEnv({
// 		themeParams: {
// 			accentTextColor: '#3e88f7',
// 			bgColor: '#222222',
// 			buttonColor: '#3e88f7',
// 			buttonTextColor: '#ffffff',
// 			destructiveTextColor: '#eb5545',
// 			headerBgColor: '#1a1a1a',
// 			hintColor: '#98989e',
// 			linkColor: '#3e88f7',
// 			secondaryBgColor: '#1c1c1d',
// 			sectionBgColor: '#2c2c2c',
// 			sectionHeaderTextColor: '#8d8e93',
// 			subtitleTextColor: '#98989e',
// 			textColor: '#ffffff',
// 		},

// 		initData: initData,
// 		initDataRaw,
// 		version: '8',
// 		platform: 'browser',
// 	});
// }

export default makeTestTgEnv;
export { makeBrowserEnv };
