import { useEffect, useRef, useState } from "react"
import { GameData } from "../DashFunData/GameData"
import { DashFunUser } from "../DashFunData/UserData"
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";
import { Env, getEnv, PaymentData } from "@/utils/DashFunApi";
import { UserLoginEvent, GameDataLoadedEvent, UserEnterGameEvent, UserPaymentEvent, UserRechargeEvent, UnloadingEvent, TopupItem, UserActivedEvent, UserXpReached5kEvent } from "../Event/Events";
import { createLogger } from "@/utils/createLogger";

const [logInfo] = createLogger("DF-FBA", {
    bgColor: '#228888',
    textColor: 'white',
    shouldLog() {
        return true;
    },
})

const firebaseConfigProd = {
    apiKey: "AIzaSyBy3kXeMl7W6QBZHQuv_Zu4fh_EqXnGGYs",
    authDomain: "fishverseweb3-1ee85.firebaseapp.com",
    projectId: "fishverseweb3-1ee85",
    storageBucket: "fishverseweb3-1ee85.firebasestorage.app",
    messagingSenderId: "1055519755845",
    appId: "1:1055519755845:web:1ada9d2b8e118035c19d2c",
    measurementId: "G-27176FLZVD"
};
const firebaseConfigTest = {
    apiKey: "AIzaSyDUrORKN3kPhqeIdWOwhm2RPP9X4VSP-R0",
    authDomain: "dashfunweb3-test.firebaseapp.com",
    projectId: "dashfunweb3-test",
    storageBucket: "dashfunweb3-test.firebasestorage.app",
    messagingSenderId: "490371722259",
    appId: "1:490371722259:web:01ab5117d481c13363e3e6",
    measurementId: "G-5NBE95FF88"
};

let firebaseConfig = firebaseConfigTest;
if (getEnv() == Env.Prod) {
    firebaseConfig = firebaseConfigProd;
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const FirebaseLoader = () => {
    const [user, setUser] = useState<DashFunUser | null>(null)
    const [game, setGame] = useState<GameData | null>(null)

    const gameRef = useRef<GameData | null>(game);
    const userRef = useRef<DashFunUser | null>(user);

    const onUserLogin = (user: DashFunUser) => {
        setUser(user)
        logInfo(false, "User Login", user.id, user.userName)
        logEvent(analytics, "login", {
            method: "Telegram",
            user_id: user.id,
        });
    }

    const onUserActived = (userId: string) => {
        logInfo(false, "User Actived", userId)
        logEvent(analytics, "user_actived", {
            user_id: userId,
        });
    }

    const onUserXpReached5k = (userId: string) => {
        logInfo(false, "User XP Reached 5k", userId)
        logEvent(analytics, "user_xp_reached_5k", {
            user_id: userId,
        });
    }

    const onGameDataLoaded = (game: GameData) => {
        setGame(game)
        logInfo(false, "Game Loaded Event", `[${game.id}]${game.name}`)
        logEvent(analytics, "Game_Loaded", {
            game_id: game.id,
            game_name: game.name,
        })
    }

    const onUserEnterGame = (game: GameData) => {
        logInfo(false, "User Enter Game", `[${game.id}]${game.name}`)
        logEvent(analytics, "Game_Enter", {
            game_id: game.id,
            game_name: game.name,
        });
    }

    const onUserPayment = (payment: PaymentData, status: "pending" | "success" | "canceled") => {
        const game = gameRef.current;
        logInfo(false, "User Payment", payment.id, status, game?.id, game?.name)

        let evtName = "";
        if (status == "pending") {
            evtName = "DashFun_Payment_Created";
        } else if (status == "success") {
            evtName = "DashFun_Payment_Success";
        } else if (status == "canceled") {
            evtName = "DashFun_Payment_Canceled";
        }

        logEvent(analytics, evtName, {
            payment_id: payment.id,
            payment_price: payment.price,
            payment_currency: "Diamond",
            payment_item: {
                item_name: payment.title,
                price: payment.price,
                quantity: 1,
            },
            game_id: game?.id || "DashFun",
            game_name: game?.name || "DashFun",
        });

    }

    const onUserRecharge = (orderId: string, status: "pending" | "success" | "canceled", payFrom: string, item: TopupItem) => {
        const game = gameRef.current;
        const affiliation = game == null ? "DashFun" : `[${game.id}]${game.name}`;
        logInfo(false, "User Recharge", orderId, { ...item }, payFrom, status)
        if (status == "pending") {
            logEvent(analytics, "begin_checkout", {
                currency: item.itemCurrency,
                value: item.getPrice(),
                items: [
                    item.toFirebaseItem(affiliation),
                ],
            });

        } else if (status == "success") {
            logEvent(analytics, "purchase", {
                transaction_id: orderId,
                currency: item.itemCurrency,
                value: item.getPrice(),
                items: [
                    item.toFirebaseItem(affiliation),
                ],
            });
        } else if (status == "canceled") {
            logEvent(analytics, "cancel_checkout", {
                currency: item.itemCurrency,
                value: item.getPrice(),
                items: [
                    item.toFirebaseItem(affiliation),
                ],
            });
        }
    }

    const onUnload = () => {
        const game = gameRef.current;
        if (game != null) {
            logEvent(analytics, "Game_Unload", {
                game_id: game.id,
                game_name: game.name,
            });
        }
    }


    useEffect(() => {
        UserLoginEvent.addListener(onUserLogin)
        GameDataLoadedEvent.addListener(onGameDataLoaded)
        UserEnterGameEvent.addListener(onUserEnterGame)
        UserPaymentEvent.addListener(onUserPayment)
        UserRechargeEvent.addListener(onUserRecharge)
        UnloadingEvent.addListener(onUnload);
        UserActivedEvent.addListener(onUserActived)
        UserXpReached5kEvent.addListener(onUserXpReached5k)
        return () => {
            UserLoginEvent.removeListener(onUserLogin)
            GameDataLoadedEvent.removeListener(onGameDataLoaded)
            UserEnterGameEvent.removeListener(onUserEnterGame)
            UserPaymentEvent.removeListener(onUserPayment)
            UserRechargeEvent.removeListener(onUserRecharge)
            UnloadingEvent.removeListener(onUnload);
            UserActivedEvent.removeListener(onUserActived)
            UserXpReached5kEvent.removeListener(onUserXpReached5k)
        }
    }, []);

    useEffect(() => {
        gameRef.current = game;
    }, [game])

    useEffect(() => {
        userRef.current = user;
    }, [user])

    return null;

}

export default FirebaseLoader;