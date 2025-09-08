import { DFLabel, DFText } from "@/components/controls";
import { FC, useEffect, useState } from "react";

//const kc_signup_url = "https://www.kucoin.com/ucenter/signup"

export const CountDown: FC<{ remaining: number }> = ({ remaining = 0 }) => {
	const [countdown, setCountdown] = useState<number>(remaining);

	useEffect(() => {
		setCountdown(remaining);
	}, [remaining]);

	//const days = Math.floor(countdown / (24 * 3600));
	const hours = Math.floor(countdown / 3600);
	const minutes = Math.floor((countdown % 3600) / 60);
	const seconds = countdown % 60;

	return (countdown <= 0 ? "" : <div className="w-full flex flex-col gap-4">
		<DFLabel rounded="lg">
			<div className="w-full flex flex-col items-center justify-center gap-2 py-2 px-4 ">
				<DFText weight="3" size="xl">Check-in After:</DFText>
				{/* <DFText weight="3" size="3xl">{hours}h {minutes}m {seconds}s</DFText> */}
				<div className="w-full flex flex-row items-center justify-center gap-4">
					<CountdownPanel countdown={hours} unit="Hr" />
					<DFText size="3xl" weight="3">:</DFText>
					<CountdownPanel countdown={minutes} unit="Min" />
					<DFText size="3xl" weight="3">:</DFText>
					<CountdownPanel countdown={seconds} unit="Sec" />
				</div>
			</div>
		</DFLabel>
	</div>
	)
}

const CountdownPanel: FC<{ countdown: number, unit: string }> = ({ countdown, unit }) => {
	return (
		<div className="flex flex-col">
			<div className="w-[70px] h-[50px] rounded-t-md bg-[#88888880] flex items-center justify-center">
				<DFText size="3xl" weight="3">{countdown.toString().padStart(2, "0")}</DFText>
			</div>
			<div className="w-[70px] h-[20px] rounded-b-md bg-[#888888F0]">
				<DFText size="sm" weight="1" className="w-full text-center">{unit}</DFText>
			</div>
		</div>
	);
}