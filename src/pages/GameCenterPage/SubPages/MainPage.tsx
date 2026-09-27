import { initData, openTelegramLink, useSignal } from "@telegram-apps/sdk-react";
import { FC, useRef, useState } from "react";

import { DFLabel, DFText } from "@/components/controls";
import ProfileHeader from "../Components/ProfileHeader";

import { FishingAvatar } from "@/components/Avatar/Avatar";
import { CountDown } from "@/components/CountDown/CountDown";
import { CryptoTickerBanner } from "@/components/NeonUI/CryptoTickerBar";
import { NeonButton, NeonCard } from "@/components/NeonUI/NeonUI";
import Section from "@/components/Section/Section";
import { FishingPostData } from "@/constats";
import iconCheckin from "@/icons/icon-checkin2.png";
import { MarketsApi, NolanDevApi, TokenMarketInfo } from "@/utils/DashFunApi";
import { Spinner } from "@telegram-apps/telegram-ui";
import { useEffectOnActive } from "keepalive-for-react";
import { Fish, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

import iconBtc from "@/icons/icon-btc.svg";
import iconEth from "@/icons/icon-eth.svg";
const fmtUSD0 = (n: number) =>
	new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
const DailyCheckinButton: FC = () => {
	const initDataRaw = useSignal(initData.raw);
	const [dailyCheckInRemaining, setDailyCheckInRemaining] = useState(-1);
	const intervalHandlerRef = useRef<number | undefined>(undefined);
	const nav = useNavigate();

	const updateDailyCheckInRemaining = async () => {
		const remaining = await NolanDevApi.checkinRemaining(initDataRaw as string)
		setDailyCheckInRemaining(remaining);
		if (remaining > 0) {
			const handler = window.setInterval(() => {
				setDailyCheckInRemaining(prev => prev > 0 ? prev - 1 : 0);
			}, 1000);
			intervalHandlerRef.current = handler;
		}
	};


	useEffectOnActive(() => {
		updateDailyCheckInRemaining();
		//setDailyCheckInRemaining(0);
		return () => {
			if (intervalHandlerRef.current !== undefined) {
				clearInterval(intervalHandlerRef.current);
			}
		}
	}, [])

	return <>
		{dailyCheckInRemaining == 0 && <NeonCard className=" cursor-pointer">
			<div className="w-full flex gap-2 items-center justify-center py-2" onClick={() => {
				if (dailyCheckInRemaining == 0) {
					nav("/game-center/daily-checkin");
				}
			}}>
				<img src={iconCheckin} alt="Check-in Icon" className="w-16 " />
				<DFText weight="2" size="2xl" className="text-center">
					Daily Alpha
				</DFText>
			</div>
		</NeonCard>}
		{
			dailyCheckInRemaining > 0 && <CountDown remaining={dailyCheckInRemaining} />
		}
	</>
}

export const GameCenter_MainPage: FC = () => {
	const initDataRaw = useSignal(initData.raw);
	const [loading, setLoading] = useState(false);
	const [posts, setPosts] = useState<FishingPostData[]>([]);
	const [tokenMap, setTokenMap] = useState<{ [symbol: string]: TokenMarketInfo }>({});

	const getPosts = async () => {
		try {
			setLoading(true);
			const posts = await NolanDevApi.getPosts(initDataRaw as string);
			setPosts(posts);
		} catch (error) {
			console.error("Failed to fetch posts:", error);
			setPosts([]);
		} finally {
			setLoading(false);
		}
	}

	const updateTokenMarketsInfo = async () => {
		const marketsInfo = await MarketsApi.get(initDataRaw as string, ["bitcoin", "ethereum"]);
		const tokenMap: { [symbol: string]: TokenMarketInfo } = {};
		marketsInfo.forEach(token => {
			tokenMap[token.symbol] = token;
		});
		setTokenMap(tokenMap);
		console.log("Token markets info updated", tokenMap);
	}

	useEffectOnActive(() => {
		getPosts();
		const handler = window.setInterval(() => {
			updateTokenMarketsInfo();
		}, 10000);

		return () => {
			window.clearInterval(handler);
		}

	}, [])

	const btcInfo = tokenMap["btc"];
	const ethInfo = tokenMap["eth"];

	if (btcInfo != null) {
		btcInfo.brief = btcInfo.brief.replace("${price}", fmtUSD0(btcInfo.current_price));
	}
	if (ethInfo != null) {
		ethInfo.brief = ethInfo.brief.replace("${price}", fmtUSD0(ethInfo.current_price));
	}

	return <div id="GameCenter_MainPage" className="w-full p-4 min-h-full flex flex-col gap-2">
		<ProfileHeader />
		<DailyCheckinButton />
		<DFLabel>
			<div className="w-full flex justify-between pl-4 items-center">
				<p>Join Community</p>
				<NeonButton className="" onClick={() => {
					openTelegramLink("https://t.me/+YkV3fvCBvFxmMDVl");
				}}>Join</NeonButton>
			</div>
		</DFLabel>
		<div  >
			<CryptoTickerBanner
				left={{ symbol: "BTC", price: btcInfo?.current_price || 0, change24h: btcInfo?.price_change_percentage_24h || 0, volume24h: btcInfo?.total_volume || 0, iconUrl: iconBtc, brife: btcInfo?.brief || "" }}
				right={{ symbol: "ETH", price: ethInfo?.current_price || 0, change24h: ethInfo?.price_change_percentage_24h || 0, volume24h: ethInfo?.total_volume || 0, iconUrl: iconEth, brife: ethInfo?.brief || "" }}
				live
			/>
		</div>
		{/* <Section disableDivider={true} key={"my-matches"} header={<div className=" text-[#e1deae] text-xl">My Matches</div>}>
			Construction in progress...
		</Section> */}
		<Section disableDivider={true} key={"angler-updates"} header={<div className=" text-[#e1deae] text-xl">Updates</div>}>
			<div className="w-full flex flex-col gap-2">
				{loading && <div className="w-full flex justify-center items-center py-4">
					<Spinner size="l" />
				</div>}
				{posts && posts.map((post) => (
					<AnglerUpdate
						key={post.postId}
						userId={post.userId}
						displayName={post.posterName}
						location={post.location}
						postTime={post.createdAt / 1000} // 转换为秒
						post={post.content}
						fish={""}
						avatarPath={""} />
				))}
			</div>
		</Section>

	</div>
}

// const MatchCell: FC = () => {
// 	return <div
// 		className="relative rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.5)] aspect-[2/1] overflow-hidden"
// 		style={{
// 			backgroundImage: `url(${matchbg})`,
// 			backgroundSize: "cover",
// 			backgroundPosition: "center",
// 			backgroundRepeat: "no-repeat",
// 		}}
// 	>
// 		{/* 渐变色边框层 */}
// 		<div
// 			className="absolute inset-0 rounded-xl pointer-events-none z-10"
// 			style={{
// 				border: "2px solid transparent",
// 				background: "linear-gradient(to bottom, #dcdcae, #726c3f) border-box",
// 				WebkitMask:
// 					"linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
// 				WebkitMaskComposite: "xor",
// 				maskComposite: "exclude",
// 			}}
// 		></div>
// 		<div
// 			className="absolute w-full h-full flex items-end justify-start p-8 pb-8">
// 			<DFText weight="1" size="4xl">
// 				Lakeside Tournament
// 			</DFText>
// 		</div>
// 		<div className="absolute top-8 -right-12 rotate-45 w-48">
// 			<div className="bg-gradient-to-br from-green-600 to-green-700
//                 text-white text-lg sm:text-sm font-semibold tracking-wider
//                 text-center py-2 shadow-md">
// 				Coming Soon
// 			</div>
// 		</div>


// 	</div >
// }


const AnglerUpdate: FC<{ userId: string, avatarPath: string, displayName: string, location: string, fish: string, postTime: number, post: string }> = (user) => {
	const now = Date.now() / 1000;
	const diff = Math.max(0, now - user.postTime);

	let timeAgo = "just now";
	if (diff < 60) {
		timeAgo = "just now";
	} else if (diff < 3600) {
		const mins = Math.floor(diff / 60);
		timeAgo = `${mins} minute${mins > 1 ? "s" : ""} ago`;
	} else if (diff < 86400) {
		const hours = Math.floor(diff / 3600);
		timeAgo = `${hours} hour${hours > 1 ? "s" : ""} ago`;
	} else {
		const days = Math.floor(diff / 86400);
		const hours = Math.floor((diff % 86400) / 3600);
		timeAgo = `${days} day${days > 1 ? "s" : ""}${hours > 0 ? ` ${hours} hour${hours > 1 ? "s" : ""}` : ""} ago`;
	}

	return <NeonCard>
		<div className="w-full flex-col gap-2 p-4 rounded-xl">
			<div className="w-full flex gap-2 items-center pb-2">
				<FishingAvatar size={48} userId={user.userId} displayName={user.displayName} />
				<div className="flex flex-col justify-center h-full">
					<DFText weight="2" size="lg">{user.displayName}</DFText>
					<DFText weight="1" size="sm">{timeAgo}</DFText>
				</div>
			</div>
			<DFText weight="1" size="m">
				{user.post}
			</DFText>
			<div className="w-full flex items-center">
				{
					(user.location != null && user.location != "") &&
					<div className="flex items-center pt-2">
						<MapPin color="#2563EB" size={20} />
						<DFText weight="1" size="sm" color="#2563EB" className="pl-[1px]">{user.location}</DFText>
					</div>
				}
				{(user.fish != null && user.fish != "") && <div className="flex-1 flex justify-end items-center pt-2">
					<Fish color="#2563EB" size={20} />
					<DFText weight="1" size="sm" color="#2563EB" className="pl-[1px]">{user.fish}</DFText>
				</div>}
			</div>
		</div >
	</NeonCard>
}
