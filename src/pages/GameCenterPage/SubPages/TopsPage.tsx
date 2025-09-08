import { LeaderBoardApi } from "@/utils/DashFunApi"
import { initData, useSignal } from "@telegram-apps/sdk-react"
import { useEffectOnActive } from "keepalive-for-react"
import { FC, useState } from "react"
import ProfileHeader from "../Components/ProfileHeader"
import Section from "@/components/Section/Section"
import xpIcon from "@/icons/dashfun-xp-icon.png"
import { toCurrency } from "@/constats"
import { DFUserAvatar } from "@/components/Avatar/Avatar"
import { DFCell, DFText } from "@/components/controls"

type TopListItem = {
	id: string,
	rank: number,
	score: number,
	username: string,
	display_name: string,
	avatar: string,
}

export const GameCenter_TopPage: FC = () => {
	const initDataRaw = useSignal(initData.raw)
	const [_loading, setLoading] = useState(false);
	const [xpTopList, setXpTopList] = useState<TopListItem[]>([]);

	const getXpTop = async () => {
		setLoading(true);
		try {
			const result = await LeaderBoardApi.fpTop(initDataRaw as string);
			setXpTopList(result);
		} finally {
			setLoading(false);
		}
	}

	useEffectOnActive(() => {
		getXpTop();
	}, [])

	const myRank = xpTopList.length > 0 ? xpTopList[xpTopList.length - 1] : null;

	return <div id="GameCenter_TopPage" className="w-full h-full flex flex-col px-4 pt-4 items-center gap-2">
		<ProfileHeader />
		<DFText size="2xl" weight="2" className="py-4 w-full text-center">FP Leaderboard</DFText>
		<LeaderboardList list={xpTopList.slice(0, -1)} />
		{myRank && <div className="w-full py-2"><LeaderboardItem item={myRank} highlight={true} /></div>}
	</div>
}

const LeaderboardList: FC<{ list: TopListItem[] }> = ({ list }) => {
	return <div className="w-full flex flex-col gap-2 h-full overflow-y-auto">
		<Section disableDivider>
			{
				list.map((item, i) => {
					return <LeaderboardItem key={i} item={item} />
				})
			}
			<div className="w-full h-3"></div>
		</Section>
	</div>
}

const LeaderboardItem: FC<{ item: TopListItem, highlight?: boolean }> = ({ item, highlight = false }) => {
	return <div className="w-full px-2">
		<DFCell className="w-full" mode={highlight ? "highlight" : "normal"}
			after={<div className="flex flex-row items-center gap-1">
				<div className="w-16 text-right">{toCurrency(item.score, 0)}</div>
				<img src={xpIcon} className="w-5 h-5" />
			</div>}
		>
			<div className="w-full flex flex-row items-center">
				<DFText color="inherit" weight="3" className="w-10 pl-1">{item.rank == 0 ? "" : item.rank}</DFText>
				<DFUserAvatar size={32} userId={item.id} avatarPath={item.avatar} displayName={item.display_name} />
				<DFText weight="1" color="inherit" size="lg" className="min-w-0 truncate pl-2">{item.display_name}</DFText>
			</div>
		</DFCell>
	</div>
}