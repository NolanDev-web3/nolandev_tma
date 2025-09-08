import wheelImg from "@/assets/wheel.png";
import pointerImg from "@/assets/wheel_pointer.png";
import wheelRingImg from "@/assets/wheel_ring.png";
import { DFButton, DFCell, DFLabel, DFText } from "@/components/controls";
import { useDashFunCoins } from "@/components/DashFun/DashFunCoins";
import { useSpinWheel } from "@/components/DashFun/DashFunSpinWheel";
import { OpenDashFunPaymentEvent } from "@/components/Event/Events";
import { L, LangKeys } from "@/components/Language/Language";
import { DashFunCoins, getCoinIcon, getCoinIcon1, SpinWheelRewardType, SpinWheelUserStatus } from "@/constats";
import { PaymentApi } from "@/utils/DashFunApi";
import { convertMilliseconds, toTimeString } from "@/utils/Utils";
import { Player } from "@lottiefiles/react-lottie-player";
import { useLaunchParams } from "@telegram-apps/sdk-react";
import { Avatar } from "@telegram-apps/telegram-ui";
import { motion, useAnimation } from "framer-motion";
import { useEffectOnActive } from "keepalive-for-react";
import { FC, useEffect, useRef, useState } from "react";
import firework from "@/assets/animation/firework2.json";

const WHEEL_SEGMENTS = 10;
const DEG_PER_SEGMENT = 360 / WHEEL_SEGMENTS;
const SEGMENT_CENTER_OFFSET = DEG_PER_SEGMENT / 2; // +18° 指向中间

const getRwawardIcon = (reward: SpinWheelRewardType | undefined) => {
	if (reward == null) return null;
	switch (reward) {
		case SpinWheelRewardType.DashFunPoint:
			return getCoinIcon(DashFunCoins.DashFunXP);
		default:
			return null;
	}
}

export const GameCenter_SpinWheelPage: FC = () => {
	const { spinWheel, spin, claim, refresh } = useSpinWheel();
	const [_1, _2, updateCoins, getCoinInfo] = useDashFunCoins();
	const controls = useAnimation();
	const [isSpinning, setIsSpinning] = useState(false);
	const [isClaiming, setIsClaiming] = useState(false);
	const [countDownInterval, setCountDownInterval] = useState<NodeJS.Timeout | null>(null);
	const [countDown, setCountDown] = useState(0);

	const coin = getCoinInfo(DashFunCoins.DashFunTicket, "name");
	const icon = getCoinIcon1(coin?.coin);
	const initDataRaw = useLaunchParams().initDataRaw;

	const playerRef = useRef<Player>(null);

	//剩余可用次数
	const total = spinWheel?.tickets_needed.length || 0;
	const remaining = total - (spinWheel?.count || 0);
	const ticketsNeeded = remaining == 0 ? 0 : (spinWheel?.tickets_needed[spinWheel.count] || 0);

	const showResult = !isSpinning && spinWheel?.status == SpinWheelUserStatus.Claimable

	useEffectOnActive(() => {
		return () => {
			if (countDownInterval != null)
				clearInterval(countDownInterval);
		}
	}, [countDownInterval])

	useEffect(() => {
		if (playerRef.current) {
			if (showResult) {
				playerRef.current.play();
			} else {
				playerRef.current.stop();
			}
		}
	}, [showResult])

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

	const doClaim = async () => {
		setIsClaiming(true);
		try {
			await claim();
		} finally {
			setIsClaiming(false);
		}
	}

	const spinAni = async () => {
		if (isSpinning) return;

		setIsSpinning(true);
		if (ticketsNeeded > (coin?.userData.amount || 0)) {
			// 没有足够的票
			const amount = ticketsNeeded - (coin?.userData.amount || 0);
			const payment = await PaymentApi.requestPayment(initDataRaw as string, {
				game_id: "DashFun",
				title: amount + " DashFun Tickets",
				desc: amount + " DashFun Tickets",
				payload: "dashfun_buy_ticket:" + amount,
				price: ticketsNeeded * (spinWheel?.ticket_price || 50),
			})

			if (payment == null) {
				// 取消支付
				setIsSpinning(false);
				return;
			}

			OpenDashFunPaymentEvent.fire(payment.paymentId, (success: boolean, _: string) => {
				if (success) {
					// 支付成功
					// 更新数据
					updateCoins && updateCoins([""])
				}
			});

			setIsSpinning(false);

			return;
		}

		// 矫正角度到初始角度
		await controls.start({
			rotate: 0,
			transition: { duration: 0 },
		});

		const t = Date.now();
		const spinWheelS = await spin();
		console.log("spin result:", spinWheelS)

		updateCoins && updateCoins([""])

		const pause = 1000 - (Date.now() - t);
		// 停顿 1 秒
		if (pause > 0) {
			await new Promise(resolve => setTimeout(resolve, pause));
		}

		const target = spinWheelS?.reward_index || 0;

		const startSpeed = 360 * 2; // 初始加速旋转 2 圈
		const slowDownRounds = 5;   // 后续减速旋转 5 圈
		const randomOffset = Math.random() * 8 - 4; // -4 到 +4
		const finalTargetAngle = 360 - target * DEG_PER_SEGMENT + randomOffset;
		const totalRotation = startSpeed + slowDownRounds * 360 + finalTargetAngle;

		console.log("spin:", target, totalRotation, finalTargetAngle);

		// 启动前先小幅反转，再进入加速 → 减速阶段
		await controls.start({
			rotate: [0, - 40],
			transition: {
				duration: 1.5,
				ease: "easeInOut"
			},
		});

		// 加速开始
		await controls.start({
			rotate: [- 40, startSpeed],
			transition: {
				duration: 1.2,
				ease: [0.12, 0, 0.39, 0], // easeInCubic
			},
		});

		await controls.start({
			rotate: [startSpeed, totalRotation],
			transition: {
				duration: 3.8,
				ease: [0.33, 1, 0.68, 1], // easeOutCubic
			},
		});

		setIsSpinning(false);
	};


	let spinText = <>{ticketsNeeded} <Avatar src={icon} size={28} /> {ticketsNeeded == 1 ? "Ticket" : "Tickets"} = 1 Spin</>
	if (isSpinning) {
		spinText = <span className="">Spinning...</span>
	}
	if (showResult) {
		const reward = spinWheel?.reward_value;
		spinText = <>You won <Avatar src={getRwawardIcon(spinWheel?.rewards[spinWheel?.reward_index].reward_type) || ""} size={28} /> {reward} !</>
	}

	if (remaining == 0 && spinWheel?.status == SpinWheelUserStatus.Claimed) {
		spinText = <>All spins used!</>
	}


	return (
		<div className="w-full h-full flex flex-col p-4 overflow-hidden">
			<DFCell mode="primary"
				subtitle={<div className="flex gap-1 justify-between w-full">
					<div className="flex gap-1 items-center justify-center"><L langKey={LangKeys.Common_Balance} />: <Avatar src={icon} size={28} />{coin?.userData.amount}</div>
					<div className="flex gap-1 items-center justify-center">Spins: {spinWheel?.count}/{spinWheel?.tickets_needed.length}</div>
				</div>
				}
			>
				<DFText weight="2" size="2xl" className="py-4 w-full text-center">Spin To Win</DFText>
			</DFCell>
			<DFText className="flex justify-center gap-1 py-2" weight="2" size="xl"> {spinText}</DFText>
			<div className="flex flex-col items-center justify-start w-full h-full">
				<div className="relative w-full max-w-[400px] aspect-square">
					<div className={"absolute top-0 left-0 bottom-0 right-0 flex items-center justify-center z-[3] transition-opacity duration-500 ease-in-out  " + (showResult ? "opacity-90" : "opacity-0")}>
						<div className="absolute top-0 left-0 bottom-0 right-0">
							<DFCell mode="highlight" className={""}>
								{(<Player
									autoplay={false}
									loop={2}
									src={firework}
									style={{ width: "100%" }}
									ref={playerRef}
								/>)}
							</DFCell>
						</div>
						<div className="absolute top-0 left-0 bottom-0 right-0 flex flex-col gap-4 items-center justify-center">
							<DFText weight="3" size="3xl" className="text-white">
								Congratulations!!!
							</DFText>
							<DFText weight="2" size="xl" className="flex items-center justify-center gap-2">You won <Avatar src={getRwawardIcon(spinWheel?.rewards[spinWheel?.reward_index].reward_type) || ""} size={28} /> {spinWheel?.reward_value} !</DFText>
						</div>
					</div>
					<img
						src={pointerImg}
						alt="pointer"
						className="absolute top-0 left-0 w-full h-full z-[2] pointer-events-none"
						style={{ filter: "drop-shadow(0 2px 6px rgba(0, 0, 0, 0.5))" }}
					/>
					<img
						src={wheelRingImg}
						alt="ring"
						className="absolute top-0 left-0 w-full h-full z-[1] pointer-events-none"
					/>
					<motion.div
						animate={controls}
						className="w-full h-full bg-contain bg-center bg-no-repeat absolute top-0 left-0"
					>
						<img
							src={wheelImg}
							alt="wheel"
							className="absolute top-0 left-0 w-full h-full"
							style={{ transform: `rotate(-${SEGMENT_CENTER_OFFSET}deg)` }}
						/>
						{spinWheel?.rewards.map((reward, i) => {
							const angle = i * DEG_PER_SEGMENT;

							let icon = getRwawardIcon(reward.reward_type) || "";

							return (
								<div
									key={i}
									className="absolute left-1/2 top-1/2 w-20 h-[75%] \
								text-center text-sm text-white font-bold\
								flex flex-col items-center"

									style={{
										transform: `translateY(-50%) translateX(-50%) rotate(${angle}deg) `
									}}
								>

									<img src={icon} style={{ width: 32 }} />
									<DFText weight="2">{reward.reward_value}</DFText>
								</div>
							);
						})}
					</motion.div>
				</div>
			</div>
			<div className="flex flex-col w-full p-4 flex-1 fixed bottom-4 left-0">
				<div className="flex flex-col w-full max-w-screen-sm sm:aligen-center sm:mx-auto px-2">
					{(remaining == 0 && spinWheel?.status == SpinWheelUserStatus.Claimed) &&
						<DFLabel>
							<div className="flex py-2 items-center justify-center">
								<DFText weight="2" size="lg">Reset In: {(() => {
									const { days, hours, minutes, seconds } = convertMilliseconds(countDown);
									return toTimeString(days, hours, minutes, seconds);
								})()}</DFText>
							</div>
						</DFLabel>
					}
					{((isSpinning || spinWheel?.status != SpinWheelUserStatus.Claimable) && remaining > 0 && <DFButton size="l" onClick={spinAni} disabled={isSpinning}>
						{isSpinning ? "Spinning" : "Spin Now!"}
					</DFButton>)}

					{((!isSpinning && spinWheel?.status == SpinWheelUserStatus.Claimable) && <DFButton size="l" onClick={doClaim} disabled={isClaiming}>
						Claim
					</DFButton>)}
				</div>
			</div>
		</div>
	);
}

