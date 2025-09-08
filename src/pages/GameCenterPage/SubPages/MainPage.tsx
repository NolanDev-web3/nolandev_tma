import { initData, openTelegramLink, useSignal } from "@telegram-apps/sdk-react";
import { FC, useState } from "react";

import { DFButton, DFCell, DFLabel, DFText } from "@/components/controls";
import ProfileHeader from "../Components/ProfileHeader";

import matchbg from "@/assets/matchbg.png";
import { FishingAvatar } from "@/components/Avatar/Avatar";
import Section from "@/components/Section/Section";
import { FishingPostData } from "@/constats";
import iconCheckin from "@/icons/icon-checkin2.png";
import { FishingVerseApi } from "@/utils/DashFunApi";
import { Spinner } from "@telegram-apps/telegram-ui";
import { useEffectOnActive } from "keepalive-for-react";
import { Fish, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CountDown } from "@/components/CountDown/CountDown";


const DailyCheckinButton: FC = () => {
	const initDataRaw = useSignal(initData.raw);
	const [dailyCheckInRemaining, setDailyCheckInRemaining] = useState(-1);
	const nav = useNavigate();

	const updateDailyCheckInRemaining = async () => {
		const remaining = await FishingVerseApi.checkinRemaining(initDataRaw as string)
		setDailyCheckInRemaining(remaining);
		if (remaining > 0) {
			setInterval(() => {
				setDailyCheckInRemaining(prev => prev > 0 ? prev - 1 : 0);
			}, 1000);
		}
	};

	useEffectOnActive(() => {
		updateDailyCheckInRemaining();
	}, [])

	return <>
		{dailyCheckInRemaining == 0 && <DFCell
			mode="wood"
			className="py-0 mt-2 mb-1 cursor-pointer"
			subtitle={<div className="flex flex-row gap-3">	</div>}
		>
			<div className="w-full flex gap-2 items-center justify-center" onClick={() => {
				if (dailyCheckInRemaining == 0) {
					nav("/game-center/daily-checkin");
				}
			}}>
				<img src={iconCheckin} alt="Check-in Icon" className="w-16 " />
				<DFText weight="2" size="2xl" className="text-center">
					Daily Check-in
				</DFText>
			</div>
		</DFCell>}
		{
			dailyCheckInRemaining > 0 && <CountDown remaining={dailyCheckInRemaining} />
		}
	</>
}

export const GameCenter_MainPage: FC = () => {
	const initDataRaw = useSignal(initData.raw);
	const [loading, setLoading] = useState(false);
	const [posts, setPosts] = useState<FishingPostData[]>([]);

	const getPosts = async () => {
		try {
			setLoading(true);
			const posts = await FishingVerseApi.getPosts(initDataRaw as string);
			setPosts(posts);
		} catch (error) {
			console.error("Failed to fetch posts:", error);
			setPosts([]);
		} finally {
			setLoading(false);
		}
	}

	useEffectOnActive(() => {
		getPosts();
	}, [])

	return <div id="GameCenter_MainPage" className="w-full p-4 min-h-full flex flex-col gap-2">
		<ProfileHeader />
		<DailyCheckinButton />
		<DFLabel>
			<div className="w-full flex justify-between pl-4 items-center">
				<p>Join Community</p>
				<DFButton className="w-20" onClick={() => {
					openTelegramLink("https://t.me/fishverseweb3group");
				}}>Join</DFButton>
			</div>
		</DFLabel>
		<div className="py-2">
			<MatchCell />
		</div>
		{/* <Section disableDivider={true} key={"my-matches"} header={<div className=" text-[#e1deae] text-xl">My Matches</div>}>
			Construction in progress...
		</Section> */}
		<Section disableDivider={true} key={"angler-updates"} header={<div className=" text-[#e1deae] text-xl">Angler Updates</div>}>
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
						fish={post.fishCatch}
						avatarPath={""} />
				))}
			</div>
		</Section>

	</div>
}

const MatchCell: FC = () => {
	return <div
		className="relative rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.5)] aspect-[2/1] overflow-hidden"
		style={{
			backgroundImage: `url(${matchbg})`,
			backgroundSize: "cover",
			backgroundPosition: "center",
			backgroundRepeat: "no-repeat",
		}}
	>
		{/* 渐变色边框层 */}
		<div
			className="absolute inset-0 rounded-xl pointer-events-none z-10"
			style={{
				border: "2px solid transparent",
				background: "linear-gradient(to bottom, #dcdcae, #726c3f) border-box",
				WebkitMask:
					"linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
				WebkitMaskComposite: "xor",
				maskComposite: "exclude",
			}}
		></div>
		<div
			className="absolute w-full h-full flex items-end justify-start p-8 pb-8">
			<DFText weight="1" size="4xl">
				Lakeside Tournament
			</DFText>
		</div>
		<div className="absolute top-8 -right-12 rotate-45 w-48">
			<div className="bg-gradient-to-br from-green-600 to-green-700
                text-white text-lg sm:text-sm font-semibold tracking-wider
                text-center py-2 shadow-md">
				Coming Soon
			</div>
		</div>


	</div >
}


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

	return <div className="w-full flex-col gap-2 bg-[#e7d4a9] p-4 rounded-xl">
		<div className="w-full flex gap-2 items-center pb-2">
			<FishingAvatar size={48} userId={user.userId} displayName={user.displayName} />
			<div className="flex flex-col justify-center h-full">
				<DFText weight="2" size="lg" color="#242f22" >{user.displayName}</DFText>
				<DFText weight="1" size="sm" color="#242f22">{timeAgo}</DFText>
			</div>
		</div>
		<DFText weight="1" size="m" color="#242f22">
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
}
