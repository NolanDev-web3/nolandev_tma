import { DFText } from "@/components/controls";
import { TaskList } from "@/components/TaskList/TaskList";
import { GameDashFun } from "@/constats";
import { useEffectOnActive } from "keepalive-for-react";
import { FC, useState } from "react";
import ProfileHeader from "../Components/ProfileHeader";
import { SpinWheelCell } from "@/components/SpinWheel/SpinWheelComponents";

export const GameCenter_TaskPage: FC = () => {
	//const { gamelist, updateGameList, loading } = useGameCenterData();
	const [game, setGame] = useState(GameDashFun());


	useEffectOnActive(() => {
		//就是为了刷新用
		setGame(GameDashFun());
	}, [])

	return <div id="GameCenter_TaskPage" className="w-full flex flex-col py-4">
		<div className="w-full flex flex-col px-4">
			<ProfileHeader />
			<DFText weight="2" size="2xl" className="py-4 w-full text-center">Tasks</DFText>
		</div>

		{/** SpinWheel部分 */}

		<SpinWheelCell />
		{/** Task List 部分 */}
		<TaskList game={game} user={null} onTaskClicked={_ => {
		}} />
	</div >
}
