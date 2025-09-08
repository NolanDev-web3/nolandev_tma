import { Player } from "@lottiefiles/react-lottie-player";
import { FC } from "react";
import aniConstruction from "@/assets/animation/construction.json";

const UnderConstruction: FC = () => {
	return (
		<div className="w-full h-full flex flex-col items-center justify-center py-4">
			<div className="text-white text-2xl font-bold">
				Under Construction
			</div>
			<Player
				autoplay
				loop={true}
				keepLastFrame={true}
				src={aniConstruction}
				style={{ maxWidth: "500px" }}
			/>

		</div>
	);
}

export default UnderConstruction;