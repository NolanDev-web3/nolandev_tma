import { SpinWheelApi } from "@/utils/DashFunApi";
import { initData, useLaunchParams, useSignal } from "@telegram-apps/sdk-react";
import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react"
import { useDashFunGame } from "./DashFunGame";
import { SpinWheelConstants, SpinWheelData, SpinWheelReward } from "../DashFunData/SpinWheelData";
import { SpinWheelInfo } from "@/constats";
import { useDashFunUser } from "./DashFunUser";

export const useDashFunSpinWheel = (): [spinwheel: SpinWheelData, spin: () => Promise<SpinWheelData | null>, claim: () => Promise<SpinWheelReward | null>] => {
	const [spinwheel, setSpinwheel] = useState<SpinWheelData | null>(null)
	const initDataRaw = useLaunchParams().initDataRaw;
	const game = useDashFunGame();

	const getSpinwheel = async () => {
		console.log("getSpinwheel", game, initData)
		if (game == null || initData == null) return;
		const sw = await SpinWheelApi.getInfo(initDataRaw as string as string);
		const d = new SpinWheelData(sw.spinwheel_id, sw.game_id, sw.status)
		// 不加的话用户切换到其他页面再切回来，会丢失已经转到的位置
		d.rewardIndex = sw.reward_index;

		if (sw.rewards) {
			for (const key in sw.rewards) {
				const r = sw.rewards[key];
				d.addReward(r.reward_index, r.reward_type, r.reward_value);
			}
		}
		console.log("======spinwheel:", d)
		setSpinwheel(d);
	}

	const spin = async (): Promise<SpinWheelData | null> => {
		console.log("spin:", spinwheel)
		if (game == null || initData == null || spinwheel == null || spinwheel.canSpin() == false) return null;

		const r = await SpinWheelApi.spin(initDataRaw as string as string);

		if (typeof (r) == "string") {
			throw r;
		}

		const d = spinwheel.copy();
		d.rewardIndex = r.reward_index;
		d.status = r.status
		setSpinwheel(d);
		return d;
	}

	const claim = async (): Promise<SpinWheelReward | null> => {
		if (game == null || initData == null || spinwheel == null || spinwheel.canClaim() == false) return null;

		const r = await SpinWheelApi.claim(initDataRaw as string as string);

		if (typeof (r) == "string") {
			throw r;
		}
		const d = spinwheel.copy();
		d.status = SpinWheelConstants.Status.Claimed;
		setSpinwheel(d);
		return spinwheel.getReward(d.rewardIndex);
	}



	useEffect(() => {
		getSpinwheel();
	}, [initData?.startParam, initDataRaw, game?.id])


	return [spinwheel as SpinWheelData, spin, claim]
}

const SpinWheelContext = createContext<{
	spinwheel: SpinWheelInfo | null,
	spin: () => Promise<SpinWheelInfo | null> | null,
	claim: () => Promise<SpinWheelInfo | null> | null,
	refresh: () => Promise<void> | null,
} | null>(null);

export const SpinWheelProvider = ({ children }: PropsWithChildren<{}>) => {
	const user = useDashFunUser();
	const [info, setInfo] = useState<SpinWheelInfo | null>(null)
	const initDataRaw = useSignal(initData.raw)

	const getSpinwheel = async () => {
		if (user == null || initDataRaw == null) return;
		const info = await SpinWheelApi.getInfo(initDataRaw as string);
		setInfo(info);
	}

	const spin = async () => {
		if (user == null || initDataRaw == null || info == null) return null;
		const r = await SpinWheelApi.spin(initDataRaw as string);
		if (typeof (r) == "string") {
			throw r;
		}
		setInfo(r);
		return r;
	}

	const claim = async () => {
		if (user == null || initDataRaw == null || info == null) return null;
		const r = await SpinWheelApi.claim(initDataRaw as string);
		if (typeof (r) == "string") {
			throw r;
		}
		setInfo(r);
		return r;
	}

	const refresh = async () => {
		if (user == null || initDataRaw == null) return;
		await getSpinwheel();
	}

	useEffect(() => {
		getSpinwheel();
	}, [user?.id])

	return <SpinWheelContext.Provider value={{ spinwheel: info, spin, claim, refresh }}>
		{children}
	</SpinWheelContext.Provider>
}

export const useSpinWheel = (): {
	spinWheel: SpinWheelInfo | null,
	spin: () => Promise<SpinWheelInfo | null> | null,
	claim: () => Promise<SpinWheelInfo | null> | null,
	refresh: () => Promise<void> | null,
} => {
	const context = useContext(SpinWheelContext);
	return {
		spinWheel: context?.spinwheel || null,
		spin: context?.spin || (() => Promise.resolve(null)),
		claim: context?.claim || (() => Promise.resolve(null)),
		refresh: context?.refresh || (() => Promise.resolve()),
	};
}