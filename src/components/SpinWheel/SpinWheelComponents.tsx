import { DashFunCoins, getCoinIcon1, SpinWheelUserStatus } from "@/constats";
import iconSpinWheel from "@/icons/icon-spinwheel.png";
import { Avatar } from "@telegram-apps/telegram-ui";
import { useNavigate } from "react-router-dom";
import { useDashFunCoins } from "../DashFun/DashFunCoins";
import { useSpinWheel } from "../DashFun/DashFunSpinWheel";
import { L, LangKeys } from "../Language/Language";
import { DFButton, DFCell, DFImage, DFLabel, DFText } from "../controls";
import { useEffect, useState } from "react";
import { convertMilliseconds, toTimeString } from "@/utils/Utils";

export const SpinWheelCell = () => {
	const { spinWheel, refresh } = useSpinWheel();
	const [_1, _2, _3, getCoinInfo] = useDashFunCoins();
	const nav = useNavigate();
	const [countDownInterval, setCountDownInterval] = useState<NodeJS.Timeout | null>(null);
	const [countDown, setCountDown] = useState(0);

	const coin = getCoinInfo(DashFunCoins.DashFunTicket, "name");
	const icon = getCoinIcon1(coin?.coin);

	useEffect(() => {
		if (spinWheel == null) {
			return
		}
		if (spinWheel.status == SpinWheelUserStatus.Claimed && remaining == 0) {
			//倒计时
			const s = spinWheel.reset_time - Date.now();
			setCountDown(s);

			const interval = setInterval(() => {
				setCountDown(prev => {
					const newCountDown = prev - 1000;
					if (newCountDown <= 0) {
						clearInterval(interval);
						refresh();
						return 0;
					}
					return newCountDown;
				});
			}, 1000);
			setCountDownInterval(interval);

		}
		return () => {
			if (countDownInterval != null)
				clearInterval(countDownInterval);
		}
	}, [spinWheel])

	if (spinWheel == null) {
		return <></>
	}

	//剩余可用次数
	const remaining = spinWheel.tickets_needed.length - spinWheel.count;
	const ticketsNeeded = remaining == 0 ? 0 : spinWheel.tickets_needed[spinWheel.count];

	return <div className="w-full flex p-4">
		<DFCell mode="primary"
			before={<DFImage disableRing src={iconSpinWheel} size={48} />}
			subtitle={<div className="flex gap-1 items-center"><L langKey={LangKeys.Common_Balance} />: <Avatar src={icon} size={28} />{coin?.userData.amount}</div>}
			after={
				(() => {
					if (remaining == 0 && spinWheel.status == SpinWheelUserStatus.Claimed) {
						//今天的次数已经用完了，且奖励也领取完了
						return <DFLabel><DFText weight="2" size="m" className="px-3 py-1">{(() => {
							const { days, hours, minutes, seconds } = convertMilliseconds(countDown);
							return toTimeString(days, hours, minutes, seconds);
						})()}</DFText></DFLabel>
					}
					return <DFButton mode="plain"
						onClick={() => {
							nav("/game-center/spin");
						}}>
						<div className="flex px-1 py-1 items-center gap-1">
							<img src={icon} style={{ width: 26 }}></img>
							<DFText weight="2" size="sm">{ticketsNeeded}</DFText>
						</div>
					</DFButton>
				})()
			}
		>
			Spin To Win
		</DFCell>
	</div>
}
