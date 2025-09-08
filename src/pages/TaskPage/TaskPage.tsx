import { GameData } from "@/components/DashFunData/GameData";
import { DashFunUser } from "@/components/DashFunData/UserData";
import { TaskList } from "@/components/TaskList/TaskList";
import { FC } from "react";

export type TaskPageType = {
	game: GameData | null
	user: DashFunUser | null
}

export const TaskPage: FC<TaskPageType> = (params) => {
	const { game, user } = params;

	return <>
		<TaskList game={game} user={user} onTaskClicked={() => { }} />
	</>
}