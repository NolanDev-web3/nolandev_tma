import AvatarUpload from "@/pages/GameCenterPage/Components/AvatarUploader";
import { FishingVerseApi } from "@/utils/DashFunApi";
import { initData, useSignal } from "@telegram-apps/sdk-react";
import { FormInput as Input } from "@/components/Design/Primitives";
import { User, Orbit } from "lucide-react";
import { FC, useState } from "react";
import { DFLabel } from "../controls";
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

	return <div className="nd-auth-shell">
		<div id="DashFunLogin" className="nd-auth" style={{ paddingTop: safeArea.top + "px", paddingBottom: safeArea.bottom + "px" }}>
            <header className="nd-auth-header"><div className="nd-auth-brand"><span className="nd-auth-mark"><Orbit size={23} /></span>NOLAN</div><span className="nd-eyebrow">ONE LAST THING</span><h1>Make yourself at home.</h1><p>Choose a photo and the name your community will see.</p></header>
			<AvatarUpload size={88} onAvatarSelected={(avatar) => {
				setAvatar(avatar)
			}} />
			<form className='nd-auth-form flex flex-col gap-4 pt-4' onSubmit={handleSubmit}>
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