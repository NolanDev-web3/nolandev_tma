import { createContext, FC, PropsWithChildren, useContext, useState } from "react";

const en: { [key: string]: string | string[] } = {
	"GameListType": [
		"Play Again",
		"Try Something New",
		"Most Popular",
		"Our Favorites",
		"Banner",
	],
	"Common_Balance": "Balance",
	"Common_Diamond": "Diamond",
	"Common_DashFunDiamond": "DashFun Diamonds",
	"Common_Get": "Get",
	"Common_Buy": "Buy",
	"Common_Purchase": "Purchase",
	"Common_Back": "Back",
	"Common_Close": "Close",
	"Common_Cancel": "Cancel",
	"Common_Confirm": "Confirm",
	"Common_In": "in",
	"Common_For": "for",

	"ProfileNoRecentGame": "You haven't played any games yet!",
	"ProfileNoFavoritesGame": "Nothing here! Add your favorite games now!",
	"ProfileRecentGames": "Recent Games",
	"ProfileFavoritesGames": "Favorites Games",
	"ProfileMyGames": "Games",
	"ProfileMyFriends": "Friends",

	"Recharge_BuyDiamondSubTitle": "Use them on all DashFun Games!",
	"Recharge_Purchase_Link_Tip": "Open the link below to complete the purchase.",

	"DashFunPay_ConfirmPurchase": "Confirm Your Purchase",
	"DashFunPay_PurchaseTip": "Do you want to buy %title in %game for %icon%price ?",
	"DashFunPay_ConfirmButton": "Confirm and Pay %icon%price"
}

export const LangKeys = {
	Common_Balance: "Common_Balance",
	Common_Diamond: "Common_Diamond",
	Common_DashFunDiamond: "Common_DashFunDiamond",
	Common_Get: "Common_Get",
	Common_Buy: "Common_Buy",
	Common_Purchase: "Common_Purchase",
	Common_Back: "Common_Back",
	Common_Close: "Common_Close",
	Common_Cancel: "Common_Cancel",
	Common_Confirm: "Common_Confirm",
	Common_In: "Common_In",
	Common_For: "Common_For",

	GameListType: "GameListType",
	ProfileNoRecentGame: "ProfileNoRecentGame",
	ProfileNoFavoritesGame: "ProfileNoFavoritesGame",
	ProfileRecentGames: "ProfileRecentGames",
	ProfileFavoritesGames: "ProfileFavoritesGames",
	ProfileMyGames: "ProfileMyGames",
	ProfileMyFriends: "ProfileMyFriends",

	Recharge_BuyDiamondSubTitle: "Recharge_BuyDiamondSubTitle",
	Recharge_Purchase_Link_Tip: "Recharge_Purchase_Link_Tip",

	DashFunPay_ConfirmPurchase: "DashFunPay_ConfirmPurchase",
	DashFunPay_PurchaseTip: "DashFunPay_PurchaseTip",
	DashFunPay_ConfirmButton: "DashFunPay_ConfirmButton",
}

let currentLang = en;

const LanguageContext = createContext<{
	get: (key: string) => string | string[]
} | null>(null);

export const LanguageProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
	const [lang, _] = useState(currentLang);

	const get = (key: string): string | string[] => {
		return lang[key];
	}

	return (
		<LanguageContext.Provider value={{ get: get }}>
			{children}
		</LanguageContext.Provider>
	);
}

export const useLanguage = () => {
	const context = useContext(LanguageContext);
	if (!context) {
		throw new Error("useLanguage must be used within a LanguageContextProvider");
	}
	return [context.get];
}

export const L = ({ langKey, index = 0 }: { langKey: string, index?: number }) => {
	const [get] = useLanguage();

	const l = get(langKey);
	if (l == null) return null;
	if (Array.isArray(l)) {
		return l[index];
	} else {
		return l;
	}
}

export const LV2 = ({ langKey, values }: { langKey: string, values: { [key: string]: string } }) => {
	const [get] = useLanguage();

	const l = get(langKey);
	if (l == null) return null;
	if (Array.isArray(l)) {
		return <></>
	}
	let str = l as string;

	for (const key in values) {
		str = str.replace(`%${key}`, values[key]);
	}

	return <p dangerouslySetInnerHTML={{ __html: str }} />
}

export const LV = ({ langKey, values }: { langKey: string, values: { [key: string]: string } }) => {
	const [get] = useLanguage();

	const l = get(langKey);
	if (l == null) return null;
	if (Array.isArray(l)) {
		return <></>
	}
	let str = l as string;

	for (const key in values) {
		str = str.replace(`%${key}`, values[key]);
	}

	return <p dangerouslySetInnerHTML={{ __html: str }} />
}
