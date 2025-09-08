import { UseDashFunCoins } from "@/components/DashFun/DashFunCoins";
import { GameData } from "@/components/DashFunData/GameData";
import { Link } from "@/components/Link/Link";
import { CoinInfo } from "@/constats";
import dashfunIcon from "@/icons/dashfun-icon.svg";
import { Env, GameApi, getEnv, TGLink, UserApi } from "@/utils/DashFunApi";
import { openTelegramLink, useLaunchParams } from "@telegram-apps/sdk-react";
import { Avatar, Cell, Headline, List, Section } from "@telegram-apps/telegram-ui";
import { SectionFooter } from "@telegram-apps/telegram-ui/dist/components/Blocks/Section/components/SectionFooter/SectionFooter";
import { TonConnectButton, useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";
import { FC } from "react";
import { IntroPageGameSection } from "./IntroPageGame";
import { ContentWrapper } from "../ContentWrapper";

export const IntroPage: FC = () => {
	const coins = UseDashFunCoins();
	const wallet = useTonWallet();
	const initDataRaw = useLaunchParams().initDataRaw;

	const [ui] = useTonConnectUI()
	ui.onStatusChange(w => {
		if (w != null) {
			UserApi.bindWalletAddress(initDataRaw as string, w.account.address)
		}
	})

	const games: GameData[] = [];

	games.push(
		new GameData({
			id: "n12u83sdngg",
			name: "Bass Tournament",
			desc: "A revolutionary Web3 fishing game",
			iconUrl: "https://res.dashfun.games/images/mzvaa3ga134/mzvy5c10cg0.png",
			url: "",
			genre: [],
			time: 0,
			openTime: 0,
			logoUrl: "",
			mainPicUrl: "",
			status: 2,
			suggest: 0,
		})
	);

	if (getEnv() == Env.Dev) {
		//开发环境下增加LocalTest
		games.push(
			new GameData({
				id: "LocalTest",
				iconUrl: "https://res.dashfun.games/icons/3kweb3-512.jpg",
				name: "Local Test",
				desc: "Local Test",
				url: "",
				genre: [],
				time: 0,
				openTime: 0,
				logoUrl: "",
				mainPicUrl: "",
				status: 1,
				suggest: 0,
			})
		);
	}

	const gamesDom: JSX.Element[] = [];

	games.forEach((g) => {
		const coin = coins.findCoinByGameId(g.id);
		const dom = <IntroPageGameSection key={g.id} game={g} coin={coin as CoinInfo} />;
		gamesDom.push(dom);
	});

	return <ContentWrapper>
		<List>
			<div className="w-full flex flex-col justify-center items-center pt-5">
				<Avatar src={dashfunIcon} size={96}></Avatar>
				<Headline weight="1" className="pt-1">DashFun</Headline>
			</div>
			<SectionFooter>
				DashFun is an upcoming mini-game platform featuring a collection of exciting and fast-paced games designed for quick, fun sessions. Stay tuned for the launch and get ready to dive into endless entertainment!
			</SectionFooter>

			<Section header="Follow US">
				<Link to="" onClick={() => openTelegramLink(TGLink.groupLink())}>
					<Cell>Join Our Telegram Group</Cell>
				</Link>
				<Link to={"https://x.com/dashfun_app"}>
					<Cell>Follow Us On X</Cell>
				</Link>
			</Section>

			{
				(
					(getEnv() == Env.Dev || getEnv() == Env.Test) &&
					<Section header="Test Functions">
						<Link to="" onClick={async () => {
							const testData = {
								data1: "data1",
								data2: "data2",
								test: true
							}

							await GameApi.setData("LocalTest", initDataRaw as string, "test_savedata", testData);
							await GameApi.setData("LocalTest", initDataRaw as string, "test_savedata_number", 12345);

							const s1 = await GameApi.getData("LocalTest", initDataRaw as string, "test_savedata");
							const s2 = await GameApi.getData("LocalTest", initDataRaw as string, "test_savedata_number");

							console.log("test_savedata", JSON.parse(s1), "test_savedata_number", s2);
						}}>
							<Cell>Test Save Function</Cell>
						</Link>
					</Section>
				)
			}

			<Section header="Connect Wallet">
				{
					wallet == null ? <div className="flex justify-center items-center w-full py-4">
						<TonConnectButton className="py-2" />
					</div> : <Cell after={<TonConnectButton />}>Your wallet: </Cell>
				}

			</Section>

			<Section header="New Games">
			</Section>
			{gamesDom}
		</List>
	</ContentWrapper>
}
