import { GameData } from "@/components/DashFunData/GameData";
import { Link } from "@/components/Link/Link";
import { CoinInfo, getCoinIcon, TaskStatus } from "@/constats";
import { TaskApi, TGLink } from "@/utils/DashFunApi";
import { openTelegramLink, useLaunchParams } from "@telegram-apps/sdk-react";
import { Avatar, Badge, Button, Cell, Section } from "@telegram-apps/telegram-ui";
import { FC, useEffect, useState } from "react";

export type GameSectionProps = JSX.IntrinsicElements['div'] & {
	game: GameData,
	coin: CoinInfo
};

export const IntroPageGameSection: FC<GameSectionProps> = ({ game, coin }) => {
	const [taskCount, setTaskCount] = useState<{ [key: number]: number }>({})
	const initDataRaw = useLaunchParams().initDataRaw;

	const getTaskCount = async () => {
		if (game != null) {
			const count = await TaskApi.getCount(initDataRaw as string, game.id)
			setTaskCount(count);
		}
	}

	useEffect(() => {
		getTaskCount();
	}, [game])

	const numb = coin == null ? 0 : coin.userData.amount
	const formatted = numb == null ? "0" : numb.toLocaleString('en-US', { style: "decimal" })

	const tc = taskCount == null || taskCount[TaskStatus.Completed] == null ? 0 : taskCount[TaskStatus.Completed]
	const tp = taskCount == null || taskCount[TaskStatus.InProgress] == null ? 0 : taskCount[TaskStatus.InProgress]

	return <Section>
		<Link to="" onClick={() => openTelegramLink(TGLink.gameLink(game.id))}>
			<Cell
				before={<Avatar size={48} src={game.getIconUrl()}></Avatar>}
				description={game.desc}
				after={<Button
					mode="filled"
					size="s"
				>
					Play
				</Button>}
			>{game.name}
			</Cell>
		</Link>
		<Link to="" onClick={() => openTelegramLink(TGLink.gameLink(game.id))}>
			<div className="flex w-full justify-end items-center px-4 py-2">
				<span className="pr-2">Your Earning:</span>
				<Avatar src={getCoinIcon(coin?.coin.name || "")} size={28} />
				<div className='relative h-[36px]'>
					{
						tc > 0 && (<div className=' absolute top-[-6px] left-[-15px]'>
							<Badge type='number'>{tc}</Badge>
						</div>)
					}
					{
						tc == 0 && tp > 0 && (<div className=' absolute top-[-6px] left-[-15px]'>
							<Badge type='number' className=' bg-gray-500' >{tp}</Badge>
						</div>)
					}
				</div>
				<span className="pl-2">{formatted}</span>
				{/* <Button mode="filled"
						before={<Avatar src={getCoinIcon(coin?.coin.name || "")} size={24} > </Avatar>}
						size="s" onClick={() => {
						}} >
						<Text>{formatted}</Text>
					</Button> */}

			</div>

			{/* <div>
				<div className="flex w-full justify-end items-center px-4 py-2">Your Earning:
					<span className="w-2"></span><Avatar src={getCoinIcon(coin?.coin.name || "")} size={28} />
					<span className="pl-2">{coin?.userData.amount || "0"}</span>
				</div>
			</div> */}
		</Link>
	</Section>
}