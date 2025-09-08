import { GameData, GameDataParams } from "@/components/DashFunData/GameData";
import { Link } from "@/components/Link/Link";
import { Page } from "@/components/Page";
import dashfunIcon from "@/icons/dashfun-icon.svg";
import { GameApi, TGLink } from "@/utils/DashFunApi";
import { openTelegramLink, useLaunchParams } from "@telegram-apps/sdk-react";
import { Avatar, Button, Cell, Divider, Headline, Image, List, Section } from "@telegram-apps/telegram-ui";
import { FC, useEffect, useState } from "react";
import { ContentWrapper } from "../ContentWrapper";

export const TestingPage: FC = () => {
	const initDataRaw = useLaunchParams().initDataRaw;
	const [testingGames, setTestingGames] = useState<GameData[]>([]);

	const loadTestingGames = async () => {
		const testingGames = await GameApi.getTestingGames(initDataRaw as string)
		if (testingGames.data != null && testingGames.data.length > 0) {
			const games = testingGames.data.map((g: GameDataParams) => new GameData(g));
			setTestingGames(games);
		}
	}

	useEffect(() => {
		loadTestingGames();
	}, [])

	return <Page back="close">
		<ContentWrapper>
			<List>
				<div className="flex justify-center items-center pt-5 gap-5">
					<Avatar src={dashfunIcon} size={48}></Avatar>
					<div className="flex flex-col justify-center items-center">
						<Headline weight="1" className="pt-1">DashFun</Headline>
						<Headline weight="1" className="pt-1">Testing Games</Headline>
					</div>
				</div>
				<Divider />
				<Section header="Game List">
				</Section>
				{
					testingGames.map(g => {
						return <Link to="#" onClick={() => openTelegramLink(TGLink.gameLink(g.id))}>
							<Cell
								before={<Image src={g.getIconUrl()} size={48}></Image>}
								description={g.desc}
								after={<Button
									mode="filled"
									size="s"
								>
									Test
								</Button>}
							>

								<div className="flex gap-2">
									<span>{g.name}</span>
									<div className="  bg-red-400 text-white text-xs font-bold rounded-[10px] p-1">TEST</div>
								</div>
							</Cell>
						</Link>
						// return <div className=" relative">
						// 	<Image src={g.getIconUrl()} size={96}></Image>
						// 	{
						// 		(
						// 			g.status <= 1 &&
						// 			<div className=" absolute left-0 top-0 bg-red-400 text-white text-xs font-bold rounded-tl-[10px] rounded-br-[10px] p-1">TEST</div>
						// 		)
						// 	}
						// 	{g.name}
						// </div>

					})
				}


			</List >
		</ContentWrapper>
	</Page>
}