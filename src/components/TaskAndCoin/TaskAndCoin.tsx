import { FC } from "react";
import { GameData } from "../DashFunData/GameData";
import { DashFunUser } from "../DashFunData/UserData";
import { Task, TaskSave } from "@/constats";
import { TaskList } from "../TaskList/TaskList";


export const TaskAndCoin: FC<{ game: GameData | null, user: DashFunUser | null, onTaskClicked: (params: { task: Task, save: TaskSave, processed: boolean }) => void }> = (p) => {
	const { game, user, onTaskClicked } = p

	return <div className="flex flex-col">
		{/* <Coins game={game} user={user} onSelected={c => {
			console.log(c);
		}} /> */}
		<TaskList game={game} user={user} onTaskClicked={onTaskClicked} />
	</div>
}