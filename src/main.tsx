import { init } from '@/init.ts';
import { postEvent, retrieveLaunchParams } from '@telegram-apps/sdk-react';
import '@telegram-apps/telegram-ui/dist/styles.css';
import { createRoot } from 'react-dom/client';
import { Root } from './components/Root.tsx';
import './index.css';
import { AccountType, Env, getEnv } from './utils/DashFunApi.tsx';
import DBMgr from './components/DBMgr/DBMgr.ts';
import "./mockEnv.ts";
import makeMockTgEnv, { makeBrowserEnv } from './mockEnv.ts';
import { currentChannel } from './utils/Utils.tsx';
import initProxy from "@/components/TelegramWebviewProxy/TelegramWebviewProxy.ts";

/**
 * tgbot绑定miniapp链接时，不需要entry/tg的路径，只需要router中的路径即可,如/game, /game-center
 * 其他环境进入需要从指定的入口进入，例如/entry/test/game,会进入test环境的game，/entry/web/game-center会进入web环境的game-center
 */


const path = window.location.href;
const idx = path.indexOf("/entry/")
var channel = "";
if (idx > 0) {
	//从entry进入，根据参数生成不同环境
	let params = path.slice(idx + 1).split("/");
	if (params[0] == "entry") {
		channel = params[1];
		if (channel == "test" && getEnv() != Env.Prod) {
			//生成测试环境的数据
			makeMockTgEnv();
		} else if (channel == "browser") {
			//web环境进入web登陆流程
			makeBrowserEnv("", "", "", AccountType.Email, "", "");
		} else if (channel == "tg") {
			//tg环境自动注入
		}
	}
} else {
	if (path.includes("app.nolandevq.com")) {
		//如果是app.nolandevq.com域名，默认是browser环境
		channel = "browser";
	} else {
		//从localStroage中获取环境，如果获取不到默认就是tg环境
		channel = currentChannel();
	}
	if (channel == "test" && getEnv() != Env.Prod) {
		//生成测试环境的数据
		makeMockTgEnv();
	} else if (channel == "browser") {
		makeBrowserEnv("", "", "", AccountType.Email, "", "");
	}
}


// //增加td_channelid参数，供tg统计使用
sessionStorage.setItem("__TD_td_channel", channel);
// const params = new URLSearchParams(window.location.search);
// if (!params.has("td_channelid")) {
// 	params.set("td_channelid", channel);

// 	const newSearch = params.toString();
// 	const newUrl = `${window.location.pathname}?${newSearch}${window.location.hash}`;
// 	//window.history.replaceState(null, '', newUrl);	
// }

// window.location.search = window.location.search + "&td_channelid=" + channel;

console.log("Platform:", retrieveLaunchParams().platform);

init(retrieveLaunchParams().startParam === 'debug' || getEnv() == Env.Dev, retrieveLaunchParams().platform)
initProxy();
postEvent("web_app_expand");
DBMgr.getInstance().openDB();

createRoot(document.getElementById('root')!).render(
	// <StrictMode>
	<Root />
	// </StrictMode>,
)