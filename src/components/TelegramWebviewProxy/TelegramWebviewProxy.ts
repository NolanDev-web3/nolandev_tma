/**
 * 非telegram内置浏览器中打开telegram miniapp的代理组件，接收telegram事件并做出回应
 */

import { createLogger } from "@/utils/createLogger";
import { isInTelegram } from "@/utils/Utils";

const [logInfo] = createLogger("DF-EventProxy", {
    bgColor: '#228888',
    textColor: 'white',
    shouldLog() {
        return true;
    },
})

const ProcessEvents = [
    "web_app_open_tg_link",
    "web_app_open_link",
]

type WebviewProxy = {
    postEvent: (...args: any[]) => void;
}

class TelegramWebviewProxy {
    postEvent(...args: any[]) {
        console.log("TelegramWebviewProxy postEvent----", args);
        logInfo(false, "Posting Event", args[0])
        if (ProcessEvents.includes(args[0])) {
            processEvent(args[0], ...args.slice(1));
        }
        return;
    }
}

class RNWebviewProxy {
    postEvent(...args: any[]) {
        console.log("RNWebviewProxy postEvent----", args);
        logInfo(false, "Posting Event", args[0])
        window.ReactNativeWebView?.postMessage(JSON.stringify({
            name: args[0],
            from: 'rn',
            args: args.slice(1)
        }));
        return;
    }
}

function processEvent(event: string, ...args: any[]) {
    logInfo(false, "Processing Event", event, args)
    switch (event) {
        case "web_app_open_tg_link":
            //打开链接
            const params = JSON.parse(args[0]);
            openLink(params["path_full"]);
            break;
        case "web_app_open_link":
            //打开链接
            const params2 = JSON.parse(args[0]);
            openLink(params2["url"]);
            break;
    }
    return;
}

const openLink = (url: string) => {
    if (url.startsWith("/game")) {
        const to = `${window.location.origin}${url}`;
        window.open(to, "_blank")
    } else if (url.startsWith("/share")) {
        const cleanedUrl = url.replace("/share/url?url=", "");
        const decodedUrl = decodeURIComponent(cleanedUrl);
        const to = `${window.location.origin}${decodedUrl}`;
        console.log(to);
    } else if (url.startsWith("/")) {
        const to = "https://t.me" + url;
        window.open(to, "_blank")
    } else {
        window.open(url, "_blank")
    }
}

const initProxy = () => {
    if (!isInTelegram()) {
        if (window.ReactNativeWebView) {
            window.TelegramWebviewProxy = new RNWebviewProxy();
            console.log("RNWebviewProxy init");
        } else {
            window.TelegramWebviewProxy = new TelegramWebviewProxy();
            console.log("TelegramWebviewProxy init");
        }
    }
}

export default initProxy
export { TelegramWebviewProxy }
export type { WebviewProxy };