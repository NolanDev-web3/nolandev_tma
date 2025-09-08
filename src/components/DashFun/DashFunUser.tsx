import { UserApi } from "@/utils/DashFunApi";
import { isInTelegram } from "@/utils/Utils";
import { initData, useSignal } from "@telegram-apps/sdk-react";
import { Spinner } from "@telegram-apps/telegram-ui";
import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { DashFunUser } from "../DashFunData/UserData";
import DashFunLogin from "../DashFunLogin/DashFunLogin";
import { UserLoginEvent, UserProfileUpdatedEvent } from "../Event/Events";
import SetupProfile from "../DashFunLogin/SetupProfile";
import { FishingVerseUserProfile } from "@/constats";


const UserContext = createContext<{
	user: DashFunUser | null,
	avatar: string | null,
} | null>(null);


export const UserProvider = ({ children }: PropsWithChildren<{}>) => {
	const [user, setUser] = useState<DashFunUser | null>(null)
	const [avatar, setAvatar] = useState<string | null>(null)
	const initDataRaw = useSignal(initData.raw)
	const initDataState = useSignal(initData.state)
	const l = useLocation();
	const [URLSearchParams] = useSearchParams();


	let referrerId = "";
	if (l.pathname.includes("game-center")) {
		//is game-center
		if (isInTelegram()) {
			referrerId = initDataState?.startParam as string || "";
		} else {
			referrerId = URLSearchParams.get("r") || "";
		}
	}
	const loginUser = async () => {
		if (initDataRaw == null) return;
		let dfUser: DashFunUser;
		dfUser = await UserApi.tgLogin(initDataRaw as string, referrerId);

		dfUser.language = initDataState?.user?.languageCode as string
		setUser(dfUser);
		UserLoginEvent.fire(dfUser);
	}

	const getAvatar = async () => {
		if (initDataRaw == null) return;
		const avatar = await UserApi.getAvatar(initDataRaw as string);
		setAvatar(avatar);
	}

	useEffect(() => {
		if (initData == null || initData.user == null) {
			return;
		}
		if (user == null || user.channelId != initDataState?.user?.id.toString()) {
			loginUser();
			getAvatar();
		}

		UserProfileUpdatedEvent.addListener(onUserProfileUpdated);

		return () => {
			UserProfileUpdatedEvent.removeListener(onUserProfileUpdated)
		}

	}, [initDataState?.user?.id, initDataRaw])

	const onUserProfileUpdated = (profile: FishingVerseUserProfile) => {
		if (user != null && profile != null) {
			console.log("onUserProfileUpdated", profile);
			setUser({
				...user,
				nickname: profile.nickname,
				avatarUrl: profile.avatar,
			})
		}
	}

	let loginComp = <div className="w-full h-full items-center justify-center flex"><Spinner size={"l"} /></div>
	if ((initDataRaw == null || initDataRaw == "") && !isInTelegram()) {
		//未登录且不在telegram中
		loginComp = <DashFunLogin />
	}

	let setupProfileComp = null;

	if (user != null && user.nickname == "") {
		//need setup profile first
		setupProfileComp = <SetupProfile />;
	}


	return <UserContext.Provider value={{ user, avatar }}>
		{user == null ? loginComp : setupProfileComp == null ? children : setupProfileComp}
	</UserContext.Provider>
}


export const useDashFunUser = (): DashFunUser | null | undefined => {
	const context = useContext(UserContext);
	return context?.user;
}

export const useDashFunAvatar = (): string => {
	const context = useContext(UserContext);
	return context?.avatar ?? "";
}
