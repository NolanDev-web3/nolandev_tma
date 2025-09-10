import dashfunIcon from "@/icons/nolan-icon-512.png";
import AvatarUpload from "@/pages/GameCenterPage/Components/AvatarUploader";
import { FishingVerseApi } from "@/utils/DashFunApi";
import { initData, useSignal } from "@telegram-apps/sdk-react";
import { Input } from "@telegram-apps/telegram-ui";
import { User } from "lucide-react";
import { FC, useState } from "react";
import { DFAvatar } from "../Avatar/Avatar";
import { DFLabel, DFText } from "../controls";
import useDashFunSafeArea from "../DashFun/DashFunSafeArea";
import { UserProfileUpdatedEvent } from "../Event/Events";
import { NeonButton } from "../NeonUI/NeonUI";
import { dataURLtoBlob } from "../Utils/File";

const SetupProfile: FC = () => {
	const { safeArea } = useDashFunSafeArea();
	const [nickname, setNickname] = useState('');
	const [avatar, setAvatar] = useState<string | null>(null);
	const [error, setError] = useState('');
	const [errorCtls, setErrorCtls] = useState({
		nickname: false,
	});
	const [uploading, setUploading] = useState(false);
	const initDataRaw = useSignal(initData.raw)

	const validateNickname = (nickname: string) => {
		// 允许所有文字（包括中文、日文等），数字，符号只能是空格或下划线
		const regex = /^[\p{L}\p{N}_ ]+$/u;

		// 长度范围
		const isValidLength = nickname.length >= 2 && nickname.length <= 14;

		// 不能以空格或下划线开头
		const notStartWithInvalid = !/^[ _\d]/.test(nickname);

		// 符合正则且长度合法且开头合法
		return regex.test(nickname) && isValidLength && notStartWithInvalid;
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const tip = "Nickname must be between 2 and 14 characters, start with a letter, and can only contain letters, numbers, underscores, or spaces.";
		setErrorCtls({ nickname: false });
		setError("");
		if (!(validateNickname(nickname))) {
			setErrorCtls({ nickname: true });
			setError(tip);
			return;
		}
		setUploading(true);
		FishingVerseApi.updateProfile(initDataRaw as string, {
			userId: "",
			nickname: nickname,
			avatar: avatar || "",
		}, dataURLtoBlob(avatar || "")).then((res) => {
			console.log("Fire Profile updated Event:", res);
			setNickname(res.nickname);
			UserProfileUpdatedEvent.fire(res);
			window.location.reload(); // 重新加载页面以更新用户信息
		}).catch((err) => {
			setError(err.message || "Failed to update profile");
		}).finally(() => {
			setUploading(false);
		});

	}

	return <div className="max-w-screen-sm sm:aligen-center sm:mx-auto h-full">
		<div id="DashFunLogin" className={"w-full h-full flex flex-col bg-gradient-to-b from-[#004275] to-[#00254E] items-center py-4"} style={{ paddingTop: safeArea.top + "px", paddingBottom: safeArea.bottom + "px" }}>
			<div className="absolute max-w-screen-sm sm:aligen-center sm:mx-auto top-[-425px] left-1/2 -translate-x-1/2 w-[100%] h-[650px] bg-[radial-gradient(circle,rgba(0,200,255,0.3)_0%,transparent_70%)] pointer-events-none z-0"></div>
			<div className='w-full flex flex-col py-4 items-center gap-2'>
				<DFAvatar src={dashfunIcon} size={128} />
				<DFText weight='3' size="3xl">NolanDev</DFText>
				<DFText weight='1' size="xl">Please setup your profile</DFText>
			</div>
			<AvatarUpload size={128} onAvatarSelected={(avatar) => {
				setAvatar(avatar)
			}} />
			<form className='w-full px-8 sm:mx-auto max-w-[400px] flex flex-col gap-4 pt-4' onSubmit={handleSubmit}>
				<div className="w-full">
					<Input
						status={errorCtls.nickname ? "error" : undefined}
						before={<User />}
						placeholder="Enter your nickname"
						value={nickname}
						onChange={(e) => setNickname(e.target.value)}
						maxLength={20}
					/>
				</div>
				{error && <DFLabel rounded="md"><div className='py-1 px-4'>{error}</div></DFLabel>}
				<NeonButton type="submit" loading={uploading} disabled={uploading}>Enter</NeonButton>
			</form>
		</div>
	</div >
}

export default SetupProfile;