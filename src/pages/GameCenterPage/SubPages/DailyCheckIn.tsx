import AddLocation from "@/components/AddLocation/AddLocation";
import { DFButton, DFText } from "@/components/controls";
import { useDashFunUser } from "@/components/DashFun/DashFunUser";
import { NolanDevApi } from "@/utils/DashFunApi";
import { initData, useSignal } from "@telegram-apps/sdk-react";
import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileHeader from "../Components/ProfileHeader";
import { NeonButton } from "@/components/NeonUI/NeonUI";

export const FishingVerse_DailyCheckIn: FC = () => {
	const user = useDashFunUser();
	const initDataRaw = useSignal(initData.raw);
	const nav = useNavigate();
	const [post, setPost] = useState("");
	const [location, setLocation] = useState<string>("");
	const [fish, setFish] = useState<string>("");
	const [posting, setPosting] = useState(false);

	const sendPost = async () => {
		if (post.trim() === "") {
			return;
		}
		setPosting(true);
		try {
			await NolanDevApi.post(initDataRaw as string, post, location, fish);
			setPost("");
			setLocation("");
			setFish("");
			nav("/game-center/main");
		} catch (e) {
			console.error("Failed to create post:", e);
		} finally {
			setPosting(false);
		}
	}

	return <div id="GameCenter_Profile" className="w-full h-full flex flex-col items-center">
		<div className="w-full flex flex-col items-center gap-4 px-4 pt-4 pb-1">
			<ProfileHeader />
			<div className="w-full flex items-center">
				<div className="w-[100px]">
					<DFText weight="1" size="lg" color="#999999" onClick={() => {
						setPost("");
						setLocation("");
						setFish("");
						nav("/game-center/main");
					}}>
						Cancel
					</DFText>
				</div>
				<div className="flex flex-col items-center flex-1">
					<DFText weight="2" size="xl">Daily Alpha</DFText>
					<DFText weight="1" size="m">@{user?.nickname}</DFText>
				</div>
				<div className="w-[100px] flex justify-end">
					<NeonButton disabled={post.trim() === "" || posting} loading={posting}
						onClick={() => sendPost()}>
						Post
					</NeonButton>
				</div>
			</div>
		</div>
		<div className="w-full h-full flex flex-col items-center gap-2 min-h-[150px] max-h-[calc(30vh)] ">
			<textarea
				className="w-full h-full p-2 border rounded resize-none text-black"
				placeholder="what's on your mind?"
				value={post}
				onChange={(e) => setPost(e.target.value)}
			/>
		</div>
		<div className="w-full flex  items-start gap-2 mt-4 justify-between px-2">
			<AddLocation onLocationChanged={l => {
				setLocation(l);
			}} />
			{/* <FishSelect onChange={(f) => {
				setFish(f);
			}} /> */}
		</div>
	</div>;
}