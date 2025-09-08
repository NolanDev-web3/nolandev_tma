import happyAni from "@/assets/animation/happy.json";
import { useDashFunCoins } from "@/components/DashFun/DashFunCoins";
import { useDashFunUser } from "@/components/DashFun/DashFunUser";
import Section from "@/components/Section/Section";
import { getCoinIcon1 } from "@/constats";
import { FriendsApi, TGLink, UserApi } from "@/utils/DashFunApi";
import { Player } from "@lottiefiles/react-lottie-player";
import { initData, shareURL, useSignal } from "@telegram-apps/sdk-react";
import { Chip, Spinner } from "@telegram-apps/telegram-ui";
import { useEffectOnActive } from "keepalive-for-react";
import { FC, useEffect, useState } from "react";
import ReactAvatar from "react-avatar";
import ProfileHeader from "../Components/ProfileHeader";
import DFButton from "@/components/controls/Button";
import { DFCell, DFLabel, DFText } from "@/components/controls";
import { isInDashFunApp, isInTelegram } from "@/utils/Utils";

export const GameCenter_FriendsPage: FC = () => {
	const user = useDashFunUser();
	const [friends, setFriends] = useState([]);
	const [rewardPoints, setRewardPoints] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const initDataRaw = useSignal(initData.raw)
	const [copied, setCopied] = useState(false);

	const getFriends = async () => {
		setIsLoading(true);
		try {
			const result = await FriendsApi.myFriends(initDataRaw as string);
			setFriends(result.friends);
			setRewardPoints(result.reward_point);
		} finally {
			setIsLoading(false);
		}
	}

	useEffectOnActive(() => {
		getFriends();
	}, [])

	return <div id="GameCenter_FriendsPage" className="w-full h-full flex flex-col px-4 pt-4 gap-4">
		<ProfileHeader />
		{
			(isInTelegram()/* || isInDashFunApp() != null*/) ?
				<DFButton size="l" onClick={() => {
					shareURL(TGLink.centerLink(user?.id));
				}}>
					Invite
				</DFButton> :
				<div className="w-full flex flex-col gap-2">
					<DFButton onClick={() => {
						if (copied) return;
						if (isInDashFunApp() == null) {
							navigator.clipboard.writeText(TGLink.centerLink(user?.id)).then(() => {
								setCopied(true);
								setTimeout(() => {
									setCopied(false);
								}, 10000);
							})
						} else {
							//在DashFun App中，发送事件
							window.TelegramWebviewProxy?.postEvent("app_share_link", JSON.stringify({ link: TGLink.centerLink(user?.id) }));
							setCopied(true);
							setTimeout(() => {
								setCopied(false);
							}, 10000);
						}
					}}>
						<div className="py-1 px-4">
							{copied ? "Copied!" : "Copy Invitation Link"}
						</div>
					</DFButton>
					{copied && <div className="flex items-center justify-center">
						<DFLabel>
							<div className="px-6 py-1">
								Share it with your friends to invite them to join DashFun!
							</div>
						</DFLabel>
					</div>}
				</div>
		}
		{/* <Button mode="filled" size="l" onClick={() => {
			shareURL(TGLink.centerLink(user?.id));
		}}>Invite</Button> */}
		<DFText size="xl" weight="2">My Friends</DFText>
		{
			isLoading && friends.length == 0 ? <div className="w-full flex items-center justify-center">
				<Spinner size="l" />
			</div> : (friends.length == 0 ? <NoFriends /> : <FriendsList friends={friends} rewardPoints={rewardPoints}></FriendsList>)
		}
	</div>
}

const FriendsList: FC<{ friends: any[], rewardPoints: any[] }> = ({ friends, rewardPoints }) => {
	return <div className="overflow-y-auto">
		<Section disableDivider gap={2}>
			{
				friends.map((f, i) => {
					return <FriendItem key={i} friend={f} rewardPoints={rewardPoints} />
				})
			}
		</Section>
	</div>
}

const FriendItem: FC<{ friend: any, rewardPoints: any[] }> = ({ friend, rewardPoints }) => {
	const [avatar, setAvatar] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const initDataRaw = useSignal(initData.raw)
	const id = friend.invited_user_id;
	const avatarFile = friend.invited_user_name.avatar;
	const displayName = friend.invited_user_name.display_name;
	const inviteType = friend.invited_type;
	const inviteStatus = friend.invited_status;

	const size = 40;

	const updateAvatar = async () => {
		if (avatarFile == "") return;
		setIsLoading(true);
		try {
			const result = await UserApi.userAvatar(initDataRaw as string, id, avatarFile);
			if (result != "") {
				setAvatar(result);
			}
		} finally {
			setIsLoading(false);
		}
	}

	useEffect(() => {
		updateAvatar();
	}, [avatarFile])

	return <div className="w-full p-1">
		<DFCell
			mode="primary"
			disableBeforeRing
			className="w-full flex items-center justify-start py-1"
			before={<div
				className="flex justify-center items-center rounded-full"
				style={{ minWidth: size, width: size, height: size }} >
				{isLoading ? <Spinner size="s" /> :
					avatar == "" ? <ReactAvatar name={displayName} round={true} size={size.toString()} textSizeRatio={2} /> : <img src={avatar} className="block object-cover   " style={{
						borderRadius: "inherit",
						width: size, height: size
					}} />}
			</div>}
			after={<InvitePrizeLabel inviteType={inviteType} inviteStatus={inviteStatus} rewardPoints={rewardPoints} />}
		>
			{displayName}
		</DFCell>
	</div>
}

const NoFriends = () => {
	return <div className="w-full h-full flex flex-col items-center justify-center">
		<Player
			autoplay
			loop
			src={happyAni}
			style={{ width: "200px" }}
		/>
		<DFText size="lg" weight="2">Invite Your Friends to DashFun! 🚀🎉</DFText>
		<DFText weight="1" color="#cccccc" className="text-center">Invite your friends and enjoy exciting challenges together. Don't miss out—start playing today!
			<br />🔥 Get ready for non-stop entertainment! 🔥</DFText>
	</div>
}

const InvitePrizeLabel: FC<{ inviteType: 1 | 2, inviteStatus: 1 | 2, rewardPoints: any[] }> = ({ inviteType, inviteStatus, rewardPoints }) => {
	const [_1, _2, _3, getCoinInfo] = useDashFunCoins();

	const rewardPoint = rewardPoints.find((r) => r.InviteUserType == inviteType);
	if (rewardPoint == null) return <></>;

	const xp = getCoinInfo("DashFunPoint", "name");
	// const coin = getCoinInfo("DashFunCoin", "name");

	const xpReward = inviteStatus == 1 ? 0 : rewardPoint.RewardPoint;
	// const coinReward = inviteStatus == 1 ? 0 : rewardPoint.RewardCoin;


	return <div className="flex flex-row items-center justify-center gap-2">
		<Chip mode="mono">
			<div className="flex flex-row items-center justify-center gap-1 rounded-xl text-white">
				{xpReward} <img src={getCoinIcon1(xp?.coin)} style={{ height: 20 }} />
			</div>
		</Chip>
		{/* <Chip mode="mono">
			<div className="flex flex-row items-center justify-center gap-1 rounded-xl">
				{coinReward} <img src={getCoinIcon1(coin?.coin)} style={{ height: 20 }} />
			</div>
		</Chip> */}
	</div>
}