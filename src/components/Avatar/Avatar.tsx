import { FC, useEffect, useState } from "react";
import { useDashFunAvatar, useDashFunUser } from "../DashFun/DashFunUser";
import ReactAvatar from "react-avatar";
import { getAvatarUrl, UserApi } from "@/utils/DashFunApi";
import { Spinner } from "@telegram-apps/telegram-ui";
import { useSignal, initData } from "@telegram-apps/sdk-react";

export const DFAvatar: FC<{ src: string, size: number, onClick?: () => void }> = ({ src, size, onClick }) => {
	return <div className=" flex justify-center items-center rounded-full relative" onClick={onClick} style={{ minWidth: size, width: size, height: size, backgroundColor: "var(--tgui--tertiary_bg_color)", boxShadow: "0 0 0 1px var(--tgui--outline)" }} >
		<img src={src} className="w-full h-full block object-cover absolute " style={{ borderRadius: "inherit" }} />
	</div>
}

export const DFProfileAvatar: FC<{ size: number, children?: React.ReactNode, onClick?: () => void }> = ({ size, children, onClick }) => {
	const avatar = useDashFunAvatar();
	const user = useDashFunUser();
	const innerSize = size - 6;

	const avatarVersion = user?.avatarUrl || "";
	let avatarUrl = "";
	if (avatarVersion != "") {
		avatarUrl = getAvatarUrl(user?.id || "", avatarVersion);
	}

	return <div className="relative flex items-center justify-center inset-0 rounded-full bg-gradient-to-br from-[#00c2ff] to-[#0042ff] p-[3px]  shadow-cyan-400/30"
		style={{ minWidth: size, width: size, height: size }} onClick={onClick}>
		{/* 内圈背景（可选）+ 头像图 */}
		<div
			className="flex justify-center items-center absolute rounded-full bg-gradient-to-br from-blue-800 to-blue-900 "
			style={{ minWidth: innerSize, width: innerSize, height: innerSize }} >
			{
				avatarUrl != "" ? <img src={avatarUrl} className="block object-cover absolute " style={{
					borderRadius: "inherit",
					width: innerSize, height: innerSize
				}} /> :
					avatar == "" ? <ReactAvatar name={user?.nickname} round={true} size={(innerSize).toString()} textSizeRatio={2.5} />
						: <img src={avatar} className="block object-cover absolute " style={{
							borderRadius: "inherit",
							width: innerSize, height: innerSize
						}} />}
		</div>
		<div className="absolute w-full h-full" >
			{children}
		</div>
	</div>
}

// const DFProfileAvatar1: FC<{ size: number, children?: React.ReactNode, onClick?: () => void }> = ({ size, children, onClick }) => {
// 	const avatar = useDashFunAvatar();
// 	const user = useDashFunUser();
// 	return <div className="relative" style={{ minWidth: size, width: size, height: size }} onClick={onClick}>
// 		<div
// 			className="flex justify-center items-center absolute rounded-full"
// 			style={{ minWidth: size, width: size, height: size }} >
// 			{avatar == "" ? <ReactAvatar name={user?.displayName} round={true} size={(size).toString()} textSizeRatio={2.5} />
// 				: <img src={avatar} className="block object-cover absolute " style={{
// 					borderRadius: "inherit",
// 					width: size - 6, height: size - 6
// 				}} />}
// 		</div>
// 		<div className="absolute w-full h-full" style={{ backgroundImage: `url(${profileBorder})`, backgroundSize: 'cover' }}></div>
// 		<div className="flex justify-center items-center absolute w-0 h-0" style={{ right: 3, bottom: 5 }} >
// 			{children}
// 		</div>
// 	</div>
// }

export const FishingAvatar: FC<{ size: number, userId: string, displayName: string, onClick?: () => void }> = ({ size, userId, displayName, onClick }) => {
	const [imgExisted, setImgExisted] = useState(true);

	const avatarUrl = getAvatarUrl(userId, "1");


	return <div className=" flex justify-center items-center rounded-full" onClick={onClick} style={{ minWidth: size, width: size, height: size, backgroundColor: "var(--tgui--tertiary_bg_color)", boxShadow: "0 0 0 1px var(--tgui--outline)" }} >
		{imgExisted ? <img src={avatarUrl} className="block object-cover" style={{
			borderRadius: "inherit",
			width: size, height: size
		}} onError={() => {
			setImgExisted(false);
		}} /> : <ReactAvatar name={displayName} round={true} size={size.toString()} textSizeRatio={2} />
		}
	</div>
}

export const DFUserAvatar: FC<{ size: number, userId: string, avatarPath: string, displayName: string, onClick?: () => void }> = ({ size, userId, avatarPath, displayName, onClick }) => {
	const [avatar, setAvatar] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const initDataRaw = useSignal(initData.raw)

	const updateAvatar = async () => {
		if (avatarPath == "") return;
		setIsLoading(true);
		try {
			const result = await UserApi.userAvatar(initDataRaw as string, userId, avatarPath);
			if (result != "") {
				setAvatar(result);
			}
		} finally {
			setIsLoading(false);
		}
	}

	useEffect(() => {
		updateAvatar();
	}, [avatarPath])

	return <div className=" flex justify-center items-center rounded-full" onClick={onClick} style={{ minWidth: size, width: size, height: size, backgroundColor: "var(--tgui--tertiary_bg_color)", boxShadow: "0 0 0 1px var(--tgui--outline)" }} >
		{isLoading ? <Spinner size="s" /> :
			avatar == "" ? <ReactAvatar name={displayName} round={true} size={size.toString()} textSizeRatio={2} /> : <img src={avatar} className="block object-cover   " style={{
				borderRadius: "inherit",
				width: size, height: size
			}} />}
	</div>

}

export const DFImageAvatar: FC<{ size: number, image: string, nickname: string, onClick?: () => void }> = ({ size, image, nickname, onClick }) => {
	return <div className=" flex justify-center items-center rounded-full" onClick={onClick} style={{ minWidth: size, width: size, height: size, backgroundColor: "var(--tgui--tertiary_bg_color)", boxShadow: "0 0 0 1px var(--tgui--outline)" }} >
		{image == "" ? <ReactAvatar name={nickname} round={true} size={size.toString()} textSizeRatio={2} /> : <img src={image} className="block object-cover   " style={{
			borderRadius: "inherit",
			width: size, height: size
		}} />}
	</div>

}