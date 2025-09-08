import { useDashFunUser } from '@/components/DashFun/DashFunUser';
import { GameData } from '@/components/DashFunData/GameData';
import { GameLauncher } from '@/components/GameLauncher/GameLauncher';
import { TaskApi, TGLink, UserApi } from '@/utils/DashFunApi';
import { SectionHeader } from '@telegram-apps/telegram-ui/dist/components/Blocks/Section/components/SectionHeader/SectionHeader';
import { ModalHeader } from '@telegram-apps/telegram-ui/dist/components/Overlays/Modal/components/ModalHeader/ModalHeader';
import { useEffect, useState, type FC } from 'react';
import Iframe from 'react-iframe';
import "./GameWrapper.css";

import { DFProfileAvatar } from '@/components/Avatar/Avatar';
import { CoinPanel, Coins } from '@/components/Coins/coins';
import { useDashFunCoins } from '@/components/DashFun/DashFunCoins';
import { useDashFunSpinWheel } from '@/components/DashFun/DashFunSpinWheel';
import { SpinWheelConstants } from '@/components/DashFunData/SpinWheelData';
import { DashFunUser } from '@/components/DashFunData/UserData';
import DashFunRecharge from '@/components/DashFunRecharge/DashFunRecharge';
import { L, LangKeys } from '@/components/Language/Language';
import { MessageListener } from '@/components/MessageListener/MessageListener';
import SpinWheel from '@/components/SpinWheel/SpinWheel';
import { TaskAndCoin } from '@/components/TaskAndCoin/TaskAndCoin';
import { CoinInfo, DashFunCoins, TaskStatus } from '@/constats';
import { isInDashFunApp, isInTelegram, isRechargeOpen } from '@/utils/Utils';
import { motion } from 'framer-motion';
import { Badge, Gamepad2, Gift, LoaderPinwheel, Send } from 'lucide-react';
import { ContentWrapper } from '../ContentWrapper';

import aniLoading1 from "@/assets/animation/loading1.json";
import aniLoading2 from "@/assets/animation/loading2.json";
import aniLoading3 from "@/assets/animation/loading3.json";
// import aniLoading4 from "@/assets/animation/loading4.json";
import aniLoading5 from "@/assets/animation/loading5.json";
import { DFBadge, DFButton, DFText } from '@/components/controls';
import useDashFunSafeArea from '@/components/DashFun/DashFunSafeArea';
import DashFunPay from '@/components/DashFunPay/DashFunPay';
import { OpenDashFunRechargeEvent, SpinWheelStatusChangedEvent, TaskStatusChangedEvent, UserEnterGameEvent } from '@/components/Event/Events';
import dashFunIcon from "@/icons/dashfun-icon-256.png";
import { Player } from '@lottiefiles/react-lottie-player';
import { backButton, openLink, openTelegramLink, shareURL, useLaunchParams } from '@telegram-apps/sdk-react';
import { Button, LargeTitle, Modal } from '@telegram-apps/telegram-ui';

const loadingAnis = [aniLoading1, aniLoading2, aniLoading3, aniLoading5];
const idx = Math.floor(Math.random() * loadingAnis.length);
const loadingAni = loadingAnis[idx];

export const GameWrapper: FC = () => {
	const [play, setPlay] = useState(false);
	const [showLoading, setShowLoadig] = useState(true);
	const [showTask, setShowTask] = useState(false);
	const [showRecharge, setShowRecharge] = useState(false);
	const [minRechargeValue, setMinRechargeValue] = useState(0);
	const [game, setGame] = useState<GameData | null>(null);
	const initDataRaw = useLaunchParams().initDataRaw;
	// const startParam = useLaunchParams().startParam;
	const user = useDashFunUser();
	// current game coin
	const [coin, setCoin] = useState<CoinInfo | null>(null);

	// const coins = UseDashFunCoins();
	const [spinWheel, _1, _2] = useDashFunSpinWheel();
	const [spinStatus, setSpinStatus] = useState(0);

	const [coins, userCoinData, updateCoins, getCoinInfo] = useDashFunCoins();

	const { safeArea, content } = useDashFunSafeArea();


	const top = safeArea.top;
	const bottom = safeArea.bottom;
	const contentTop = content.top;
	const contentBottom = content.bottom;

	const pt = top + contentTop;
	const pb = bottom + contentBottom;

	const [taskCount, setTaskCount] = useState<{ [key: number]: number }>({})

	const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

	const getTaskCount = async () => {
		if (game != null) {
			const count = await TaskApi.getCount(initDataRaw as string, game.id)
			setTaskCount(count);
		}
	}

	const onShare = () => {
		if (game != null) {
			shareURL(game.tgLink());
		}
	}

	const onBackToCenter = () => {
		if (isInTelegram()) {
			openTelegramLink(TGLink.centerLink());
		} else {
			openLink(TGLink.centerLink());
		}
		//util.openTelegramLink(TGLink.botLink())
	}

	const openTaskUI = async () => {
		setShowTask(true);
	}

	useEffect(() => {
		setSpinStatus(spinWheel?.status || 0);
	}, [spinWheel])

	const evtListener = (_taskId: string, _status: number) => {
		//任务状态变化，重新获取task count
		console.log("get task count....")
		getTaskCount();
		//获取coin变化
		updateCoins && updateCoins([game?.id || ""])
	}

	const spinListener = (_spinId: string, status: number) => {
		setSpinStatus(status)
	}

	const openRechargeEvtListener = (minRechargeValue: number) => {
		setMinRechargeValue(minRechargeValue);
		setShowRecharge(true);
	}

	useEffect(() => {
		if (userCoinData != null) {
			// if (game != null) {
			const info = getCoinInfo(DashFunCoins.DashFunXP, "name");
			if (info != null) {
				setCoin(info);
			}
			// }
		}
	}, [coins, userCoinData])


	useEffect(() => {
		getTaskCount();
		if (updateCoins)
			updateCoins([game?.id || ""])

		TaskStatusChangedEvent.addListener(evtListener);
		SpinWheelStatusChangedEvent.addListener(spinListener);
		OpenDashFunRechargeEvent.addListener(openRechargeEvtListener);

		return () => {
			TaskStatusChangedEvent.removeListener(evtListener);
			SpinWheelStatusChangedEvent.removeListener(spinListener);
			OpenDashFunRechargeEvent.removeListener(openRechargeEvtListener);
		}
	}, [game]);

	useEffect(() => {
		if (showRecharge && isInDashFunApp() == null) {
			backButton.show();
			return backButton.onClick(() => {
				setShowRecharge(false);
			});
		} else {
			backButton.hide();
			setMinRechargeValue(0);
		}
	}, [showRecharge])

	useEffect(() => {
		const handleResize = () => {
			setWindowSize({ width: window.innerWidth, height: window.innerHeight });
		};
		window.addEventListener('resize', handleResize);
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, []);


	// const numb = coin?.userData?.amount || 0;
	// const formatted = numb == null ? "0" : numb.toLocaleString('en-US', { style: "decimal" })

	const tc = taskCount == null || taskCount[TaskStatus.Completed] == null ? 0 : taskCount[TaskStatus.Completed]
	const tp = taskCount == null || taskCount[TaskStatus.InProgress] == null ? 0 : taskCount[TaskStatus.InProgress]

	const diamond = getCoinInfo("DashFunDiamond", "name");

	const tabs = [
		{
			id: "tasks",
			text: "Tasks",
			Icon: () => <div>
				<div className=' relative w-[24px] h-[1px]'>
					<div className=' absolute left-[12px] top-[-5px]'>
						{
							tc > 0 && <Badge type='number'>{tc}</Badge>
						}
						{
							tc == 0 && tp > 0 && <Badge type='number' className=' bg-gray-500' >{tp}</Badge>
						}
					</div>
				</div>
				<Gift absoluteStrokeWidth className='my-1' />
			</div>,
			component: <TaskAndCoin user={user as DashFunUser} game={game} onTaskClicked={({ processed }) => {
				if (processed) {
					//关掉list，让用户重新开启以便刷新状态
					setShowTask(false);
				}
			}} />
		},
		{
			id: "spin",
			text: "Spin",
			Icon: () => <div>
				<div className=' relative w-[24px] h-[1px]'>
					<div className=' absolute left-[12px] top-[-5px]'>
						{
							spinStatus == SpinWheelConstants.Status.CanClaim && <Badge type='number'>{1}</Badge>
						}
						{
							spinStatus == SpinWheelConstants.Status.Spin && <Badge type='number' className=' bg-gray-500' >{1}</Badge>
						}
					</div>
				</div><LoaderPinwheel strokeWidth={2} absoluteStrokeWidth className='my-1' />
			</div>,
			component: <>
				<Coins game={game} user={user as DashFunUser} onSelected={c => {
					console.log("ccc", c);
				}} />
				<div className="w-full flex justify-center items-center">
					<LargeTitle weight="3">
						Spin & Win Daily
					</LargeTitle>
				</div>
				<SpinWheel user={user as DashFunUser} game={game} />
			</>

		},
	];



	// const [currentTab, setCurrentTab] = useState(tabs[0].id);

	const avatarWidth = window.innerWidth > 400 ? 40 : 32;

	let adjustedSize = { ...windowSize };

	if (adjustedSize.width > 640) {
		adjustedSize.width = adjustedSize.height * (9 / 16)
		if (adjustedSize.width > 640) {
			adjustedSize.width = 640;
		}
	}

	const header = <SectionHeader
		className='px-2'
		style={{
			paddingTop: "5px",
			paddingBottom: "5px",
		}}>
		<div className='game-title max-w-screen-sm sm:mx-auto flex items-center gap-2'>
			<DFProfileAvatar size={avatarWidth} onClick={() => {
				openTaskUI();
				getTaskCount();
			}}>
				{
					tc > 0 && (<div className='relative w-[90%] h-[90%]'>
						<DFBadge position="bottom-right" color="red">{tc}</DFBadge>
					</div>)
				}
				{
					tc == 0 && tp > 0 && (<div className='relative w-[90%] h-[90%]'>
						<DFBadge position="bottom-right" className=''>{tp}</DFBadge>
					</div>)
				}
			</DFProfileAvatar>

			<div className='w-56 gap-2 flex items-center justify-between'>
				<div className='w-24'>
					<CoinPanel coin={coin?.coin} userCoinData={coin?.userData} showBG />
				</div>
				<div className='flex-1'>
					<CoinPanel showBG coin={diamond?.coin} userCoinData={diamond?.userData} showAdd={isRechargeOpen()} onClick={() => {
						if (isRechargeOpen()) {
							setShowRecharge(true);
						}
					}} />
				</div>
			</div>
			{/* <Button mode="white"
				before={<Avatar src={getCoinIcon1(coin?.coin ?? null)} size={24} > </Avatar>}
				size="s" onClick={() => {
					openTaskUI();
					getTaskCount();
				}} >
				<Text className='text-black'>{formatted}</Text>

			</Button> */}
			{/* <div className='flex-1 relative'>
				{
					tc > 0 && (<div className=' absolute top-0 left-[-15px]'>
						<Badge type='number'>{tc}</Badge>
					</div>)
				}
				{
					tc == 0 && tp > 0 && (<div className=' absolute top-0 left-[-15px]'>
						<Badge type='number' className=' bg-gray-500' >{tp}</Badge>
					</div>)
				}
			</div> */}
			<div className='flex gap-1 items-end flex-1 justify-end'>
				<DFButton size="m" onClick={() => {
					onBackToCenter();
				}} ><Gamepad2 size="24" strokeWidth={2} absoluteStrokeWidth /> </DFButton>
				{(isInTelegram() && <DFButton size="m" mode="normal" onClick={() => {
					onShare();
				}}><Send size="20" strokeWidth={1.5} absoluteStrokeWidth /></DFButton>)}
			</div>
		</div>
	</SectionHeader>

	return <div id="game-wrapper" className='w-full h-full flex flex-col'>
		<MessageListener />
		<div className="game-wrapper max-w-screen-sm sm:mx-auto" style={{ paddingTop: pt, paddingBottom: pb }}>
			{header}
			<div id="game-iframe" className=' flex flex-1 h-full items-center justify-center' >
				<div id="frame-wrapper" className=' h-full' style={{ width: adjustedSize.width }}>
					<Iframe
						id='GameFrame'
						name='GameFrame'
						url={game == null ? "" : game.url}
						display="block"
						width='100%'
						height="100%"
						frameBorder={0}
						className='game-frame'
						styles={{
							visibility: play ? "" : "hidden"
						}}
					/>
				</div>
				{showLoading && (<div className={`flex flex-col bg-gradient-to-b from-[#004275] to-[#00254E] justify-start items-center game-loading ${play ? ", game-loading-fadeout" : ""}`}
					style={{ paddingTop: pt, paddingBottom: pb }}>
					<div className='w-full'>
						{header}
					</div>
					<div className='max-w-screen-sm mx-auto flex flex-col items-center justify-center relative' style={{ width: "90vw", paddingTop: "10px" }}>
						<img src={dashFunIcon}
							className='absolute top-[50px] opacity-[0.05]'
							alt="DashFun" style={{ width: 200, height: 200 }} />
						<Player
							autoplay
							loop={true}
							src={loadingAni}
							className='h-[300px] aspect-square'
						/>
						<DFText weight='2' size="lg">First-time loading might take a while</DFText>
						<div className='w-full fixed bottom-0 max-w-screen-sm mx-auto '>
							<GameLauncher gameId={undefined}
								footer={null}
								onLoad={g => {
									setGame(g as GameData);
								}}
								onPlayClicked={() => {
									//上报enterGame
									if (game != null) {
										console.log("report user enter game:", game)
										UserApi.enterGame(initDataRaw as string, game.id)
										setPlay(true);
										setShowLoadig(false);
										UserEnterGameEvent.fire(game);
										//不要淡出了
										// setTimeout(() => {
										// 	setShowLoadig(false);
										// }, 2000);
									}
								}} />
						</div>
					</div>
					{/* <Modal
						className='max-w-screen-sm sm:mx-auto'
						dismissible={false}
						open={play == false}
						style={{ backgroundColor: "transparent" }}
						overlayComponent={
							<div className=' bg-[#21212130] pointer-events-auto fixed left-0 right-0 z-[var(--tgui--z-index--overlay)]' style={{ top: pt + "px", bottom: pb + "px" }}>
								{header}
							</div>
						}
					>

						
					</Modal> */}
				</div>)
				}
				{
					showTask && (
						<Modal
							className='max-w-screen-sm sm:mx-auto'
							open={showTask}
							header={<ModalHeader style={{
								backgroundColor: "#004275",
							}}></ModalHeader>
								// <div className='flex flex-col bg-gray-200 text-black p-2 w-full items-center justify-center gap-1'>
								// 	<div className=' w-10 h-1 bg-gray-400 rounded-full mb-2'></div>
								// 	<Text weight='1'>Tasks</Text>
								// </div>
							}
							onOpenChange={e => {
								if (e == false) {
									setShowTask(false);
								}
							}}
							snapPoints={[0.9]}
						>
							<div className='flex flex-col w-full h-full bg-gradient-to-b from-[#004275] to-[#00254E]' style={{
							}}>
								{/** 250320 暂时去掉了tab栏，只显示任务列表了 */}
								<div style={{ paddingBottom: "calc(10vh + 100px) " }}>
									{tabs[0].component}
								</div>
								{/* <div style={{ paddingBottom: "calc(10vh + 100px) " }}>
									{tabs.find((t) => t.id == currentTab)?.component}
								</div>

								<Tabbar id="bottomNavigation" style={{ bottom: "10vh" }}>
									{tabs.map(({ id, text, Icon }) => (
										<Tabbar.Item
											key={id}
											text={text}
											selected={id === currentTab}
											onClick={() => setCurrentTab(id)}
											style={{ paddingBottom: bottom + "px" }}
										>
											<Icon />
										</Tabbar.Item>
									))}
								</Tabbar> */}
							</div>
						</Modal>
					)
				}
			</div >
		</div >
		{
			showRecharge && (
				<div id="recharge-overlay" className='pointer-events-auto absolute top-0 bottom-0 left-0 right-0 z-[9999]'>
					<ContentWrapper className='h-full max-w-screen-md md:mx-auto bg-gradient-to-b from-[#004275] to-[#00254E]'>
						<motion.div
							className='w-full h-full'
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.5 }}
						>
							<div className='flex flex-col w-full h-full max-h-full min-h-0 '>
								{!isInTelegram() &&
									<div className='p-4'>
										<Button mode="plain" onClick={() => { setShowRecharge(false) }}>
											<L langKey={LangKeys.Common_Close} />
										</Button>
									</div>
								}
								<div className='w-full min-h-0 flex-1'>
									<DashFunRecharge gameId={game?.id || ""} minRechargeValue={minRechargeValue} />
								</div>
							</div>
						</motion.div>
					</ContentWrapper>
				</div>
			)
		}
		<DashFunPay />
	</div >
}	