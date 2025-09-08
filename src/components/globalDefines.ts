import { WebviewProxy } from "./TelegramWebviewProxy/TelegramWebviewProxy";

enum ProfileType {
    ANONYMOUS = 0,
    REGISTERED = 1,
    SINA_WEIBO = 2,
    QQ = 3,
    TENCENT_WEIBO = 4,
    ND91 = 5,
    WEIXIN = 6,
    Telegram = 11,
    TYPE2 = 12,
    TYPE3 = 13,
    TYPE4 = 14,
    TYPE5 = 15,
    TYPE6 = 16,
    TYPE7 = 17,
    TYPE8 = 18,
    TYPE9 = 19,
    TYPE10 = 20,
}

interface TDAPPInterface {
    login: (opt: {
        profileId: string,
        profileType: ProfileType,
        name: string, //账户名字
        gender: number | 0, //性别 0:未知 1:男 2:女
        age?: number, //年龄
        //property1~10是自定义属性，自行添加
        property1?: number | string,  //自定义属性
        property2?: number | string,  //自定义属性
    }) => void;

    onPlaceOrder: (order: { orderId: string, amount: number, currencyType: string }) => void;
    onOrderPaySucc: (order: { orderId: string, amount: number, currencyType: string, paymentType: string }) => void;
    onCancelOrder: (order: { orderId: string, amount: number, currencyType: string }) => void;

    onEvent: (eventId: string, label?: string, params?: Record<string, any>) => void;
    flush?: () => void;
}


declare global {
    interface Window {
        dashfun_app: "ios" | "android" | null;
        TelegramWebviewProxy?: WebviewProxy;
        ReactNativeWebView?: { postMessage: (message: any) => void; };
        TDAPP?: TDAPPInterface;
        TD_CHANNEL: string;
        aplus_queue: {
            push: (args: {
                action: string,
                arguments: any[]
            }) => void;
        }
    }
}

export { ProfileType };
export type { TDAPPInterface };
