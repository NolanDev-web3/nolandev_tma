import { DFButton, DFText } from "@/components/controls";
import useDashFunSafeArea from "@/components/DashFun/DashFunSafeArea";
import { useDashFunUser } from "@/components/DashFun/DashFunUser";
import { UserProfileUpdatedEvent } from "@/components/Event/Events";
import { dataURLtoBlob } from "@/components/Utils/File";
import { makeBrowserEnv } from "@/mockEnv";
import { AccApi, AccountType, DashFunAccount, FishingVerseApi, getAvatarUrl, getEnv } from "@/utils/DashFunApi";
import { isInTelegram } from "@/utils/Utils";
import { initData, useSignal } from "@telegram-apps/sdk-react";
import { Input, Modal } from "@telegram-apps/telegram-ui";
import { ModalHeader } from "@telegram-apps/telegram-ui/dist/components/Overlays/Modal/components/ModalHeader/ModalHeader";
import { FC, PropsWithChildren, ReactNode, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import AvatarUpload from "../Components/AvatarUploader";
import ProfileHeader from "../Components/ProfileHeader";

export const GameCenter_Profile: FC = () => {
	const nav = useNavigate();
	const [loading, setLoading] = useState(false);
	const [showDelete, setShowDelete] = useState(false);
	const { safeArea, content } = useDashFunSafeArea();
	const [dleteInput, setDeleteInput] = useState("");
	const [avatar, setAvatar] = useState<string | null>(null);
	const [uploading, setUploading] = useState(false);
	const initDataRaw = useSignal(initData.raw);
	const user = useDashFunUser();
	// const tabItems = [
	// 	{
	// 		icon: <UsersRound size={20} />,
	// 		name: get(LangKeys.ProfileMyFriends),
	// 		item: <MyFriends />
	// 	},
	// 	{
	// 		icon: <Gamepad2 />,
	// 		name: get(LangKeys.ProfileMyGames),
	// 		item: <MyGames />
	// 	}
	// ]

	const signOut = useCallback(() => {
		localStorage.removeItem('DashFun-Token-' + getEnv());
		setLoading(true);

		makeBrowserEnv("", "", "", AccountType.Email, "", "");
		initData.restore();

		setTimeout(() => {
			setLoading(false);
			nav("/game-center");
			window.location.reload();
		}, 1000);
	}, [nav]);

	const setAsAvatar = async () => {
		setUploading(true);
		FishingVerseApi.updateProfile(initDataRaw as string, {
			userId: "",
			nickname: "",
			avatar: avatar || "",
		}, dataURLtoBlob(avatar || "")).then((res) => {
			console.log("Fire Profile updated Event:", res);
			UserProfileUpdatedEvent.fire(res);
			window.location.reload(); // 重新加载页面以更新用户信息
		}).finally(() => {
			setUploading(false);
		});
	}

	const avatarVersion = user?.avatarUrl || "";
	let avatarUrl = "";
	if (avatarVersion != "") {
		avatarUrl = getAvatarUrl(user?.id || "", avatarVersion);
	}

	return <div id="GameCenter_Profile" className="w-full flex flex-col gap-4 p-4">
		<ProfileHeader disableClick />

		<Section header="">
			<div className="w-full flex flex-col gap-2 h-[182px] items-center justify-center">
				<AvatarUpload size={128}
					defaultAvatarUrl={avatarUrl}
					onAvatarSelected={(avatar) => { setAvatar(avatar) }} />
				{
					avatar && <DFButton className="w-full max-w-[200px]" loading={uploading} disabled={uploading} onClick={() => {
						setAsAvatar();
					}}>Set as Avatar</DFButton>
				}
			</div>

		</Section>

		{(
			!isInTelegram() && <div className="w-full flex flex-col flex-1 justify-end">
				<DFButton mode="normal" loading={loading} disabled={loading} onClick={() => {
					signOut();
				}}>Sign Out</DFButton>
			</div>
		)}

		{
			(
				!isInTelegram() /*&& isInDashFunApp() == 'ios'*/ && <div>
					<div className="left-4 right-4 flex flex-col flex-1 justify-end absolute max-w-screen-sm sm:mx-auto" style={{ bottom: safeArea.bottom }}>
						<DFButton mode="danger" loading={loading} disabled={loading} onClick={() => {
							setShowDelete(true);
						}}>Delete My Account</DFButton>
					</div>

					<Modal
						className='max-w-screen-sm sm:mx-auto bg-gradient-to-b from-[#004275] to-[#00254E]'
						open={showDelete}
						header={<ModalHeader style={{
							backgroundColor: "",
						}}></ModalHeader>
							// <div className='flex flex-col bg-gray-200 text-black p-2 w-full items-center justify-center gap-1'>
							// 	<div className=' w-10 h-1 bg-gray-400 rounded-full mb-2'></div>
							// 	<Text weight='1'>Tasks</Text>
							// </div>
						}
						onOpenChange={e => {
							if (e == false) {
								setShowDelete(false);
								setDeleteInput("");
							}
						}}
						snapPoints={[1]}
					>
						<div className='flex flex-col w-full h-full' style={{
							paddingBottom: safeArea.bottom + content.bottom
						}}>
							<div className="flex flex-col items-center justify-center gap-4 px-4 pb-4">
								<DFText weight="2" size="xl" color="#ff4444">
									Delete My Account
								</DFText>
								<DFText weight="1" size="sm">
									Are you sure you want to permanently delete your account? This action cannot be undone and all your data will be lost.
								</DFText>
								<div className="w-full flex justify-center items-center gap-1">
									<DFText weight="1" size="sm">
										Please enter
									</DFText>
									<DFText weight="3" size="sm" color="#ff4444">
										"DELETE"
									</DFText>
									<DFText weight="1" size="sm">
										below to confirm
									</DFText>
								</div>
								<div className="w-full">
									<Input
										status={undefined}
										type="text"
										value={dleteInput}
										placeholder="DELETE"
										onChange={(e) => {
											setDeleteInput(e.target.value);
										}}
									/>
								</div>
								<DFButton
									mode="danger"
									disabled={loading || dleteInput.toUpperCase() !== "DELETE"}
									onClick={() => {
										setLoading(true);
										const token = localStorage.getItem('DashFun-Token-' + getEnv());
										if (token) {
											const decodedAcc = JSON.parse(atob(token)) as DashFunAccount;
											if (decodedAcc == null) {
												setLoading(false);
												return false;
											}
											AccApi.deleteAccount(decodedAcc.account_id, decodedAcc.token, decodedAcc.type).then(() => {
												signOut();
											}).catch((err) => {
												console.error("Failed to delete account:", err);
												setLoading(false);
											}).finally(() => {
												setLoading(false);
											});
										}
									}}
								>
									Delete My Account
								</DFButton>
							</div>
						</div>
					</Modal>

				</div>
			)
		}

	</div >
}

// const TopBar: FC<{ avatar: string, user: DashFunUser | null | undefined }> = ({ avatar, user }) => {
// 	return <div className="w-full flex flex-row">
// 		<DFAvatar size={64} src={avatar} />
// 		<div className="flex flex-1 flex-col pl-4 justify-center">
// 			<Headline weight="2">{user?.displayName}</Headline>
// 			<Text weight="3" style={{ color: "var(--tgui--hint_color)" }}> {user?.userName ? "@" + user?.userName : ""}</Text>
// 		</div>
// 	</div>
// }

const Section: FC<PropsWithChildren<{ header: string, icon?: ReactNode }>> = ({ header, icon, children }) => {
	return <div className="relative w-full rounded-xl p-3 shadow-[0_4px_12px_rgba(0,0,0,0.5)] bg-gradient-to-br from-[#1E6493] to-[#0C3D63]">
		<div className="absolute inset-0 rounded-xl ring-1 ring-blue-400/50 pointer-events-none z-0"></div>
		<div className="flex flex-row items-center pb-2">
			{icon && <div className="mr-2">{icon}</div>}
			<DFText size="xl" weight="2">{header}</DFText>
		</div>
		{children}
	</div>
}

// const MyGames: FC = () => {
// 	const { gamelist, updateGameList, loading } = useGameCenterData();
// 	const [get] = useLanguage();
// 	const [recentList, setRecentList] = useState<string[]>([]);
// 	const [favoritesList, setFavoritesList] = useState<string[]>([]);

// 	const updateList = useCallback(() => {
// 		const recentList = gamelist?.game_list[GameListType.Played] ?? [];
// 		const favoritesList = gamelist?.game_list[GameListType.Favorites] ?? [];
// 		setRecentList(recentList);
// 		setFavoritesList(favoritesList);
// 	}, [gamelist])

// 	useEffectOnActive(() => {
// 		if (updateGameList) {
// 			updateGameList([GameListType.Played, GameListType.Favorites]).then(() => {
// 				updateList();
// 			})
// 		}
// 	}, [])

// 	useEffect(() => {
// 		updateList();
// 	}, [gamelist])

// 	return <div className="w-full flex flex-col gap-4">
// 		<Section
// 			header={get(LangKeys.ProfileRecentGames) as string}
// 		>
// 			{
// 				!loading && (recentList.length == 0 ?
// 					<DFText weight="1" size="m" color="#cccccc">
// 						<L langKey={LangKeys.ProfileNoRecentGame} />
// 					</DFText> :
// 					<div className="w-full overflow-x-auto hide-scrollbar">
// 						<div>
// 							<div className="grid grid-flow-col-dense auto-cols-max gap-4 min-h-[64px]">
// 								{recentList.map((gameId) => {
// 									const game = gamelist?.getGame(gameId);
// 									return <div className="flex flex-col justify-center items-center" style={{ width: 64 }} key={gameId}>
// 										<GameIcon game={game} size={64} onClick={() => { console.log("onclick") }}></GameIcon>
// 										<DFText weight="1" size="xs" className="w-full pt-2 truncate overflow-hidden min-w-0 text-center">
// 											{game?.name}
// 										</DFText>
// 									</div>
// 								})}
// 							</div>
// 						</div>
// 					</div>)
// 			}
// 		</Section>

// 		<Section
// 			header={get(LangKeys.ProfileFavoritesGames) as string}
// 			icon={<Heart stroke="0" fill="#ef4444" />}
// 		>
// 			{
// 				!loading && (favoritesList.length == 0 ?
// 					<DFText weight="1" color="#cccccc" size="m">
// 						<L langKey={LangKeys.ProfileNoFavoritesGame} />
// 					</DFText> :
// 					<div className="w-full overflow-x-auto hide-scrollbar">
// 						<div>
// 							<div className="grid grid-flow-col-dense auto-cols-max gap-2 min-h-[64px]">
// 								{favoritesList.reverse().map((gameId) => {
// 									const game = gamelist?.getGame(gameId);
// 									return <div className="flex flex-col justify-center items-center" style={{ width: 64 }} key={gameId}>
// 										<GameIcon game={game} size={64} onClick={() => { console.log("onclick") }}></GameIcon>
// 										<DFText weight="1" size="xs" className="w-full pt-2 truncate overflow-hidden min-w-0 text-center">
// 											{game?.name}
// 										</DFText>
// 									</div>
// 								})}
// 							</div>
// 						</div>
// 					</div>)
// 			}
// 		</Section>
// 	</div>
// }

// const MyFriends: FC = () => {
// 	return <div>My Friends</div>
// }