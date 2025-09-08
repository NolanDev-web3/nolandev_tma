import { DFButton, DFCell, DFImage, DFLabel, DFText } from "@/components/controls";
import { DFInfoLabel } from "@/components/controls/Label";
import { useAirdropData, useDFBalance, useUpdateAirdropData, useUpdateVestingInfo, useUserClaimTokens, useVestingInfo, useWaitingForTransaction, Web3Provider } from "@/components/Wallet/airdrop_contract";
import iconDashFun from "@/icons/dashfun-icon-256.png";
import kcLogo from "@/icons/kc-logo.svg";
import { AirdropApi, AirdropVestingRequest, Env, getEnv } from "@/utils/DashFunApi";
import { isInTelegram, sleep } from "@/utils/Utils";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { useLaunchParams } from "@telegram-apps/sdk-react";
import { Input, Spinner } from "@telegram-apps/telegram-ui";
import { FC, useState } from "react";
import ProfileHeader from "../Components/ProfileHeader";
import { TGECountDown } from "../Components/TGECountDown";

const kc_signup_url = "https://www.kucoin.com/ucenter/signup"

export const GameCenter_WalletPage: FC = () => {
	return <Web3Provider>
		{
			isInTelegram() ? <_PageInTG /> : <_Page />
		}
	</Web3Provider>
}

const _PageInTG: FC = () => {
	return <div id="GameCenter_WalletPage" className="w-full h-full flex flex-col px-4 pt-4 gap-4">
		<ProfileHeader />
		<TGECountDown />
		<VestingInfo />
		<DFCell mode="normal" className="w-full" subtitle="https://app.dashfun.games">
			Please go to our website to claim your tokens.
			<DFButton size="m" onClick={() => {
				window.open("https://app.dashfun.games", "_blank");
			}}>Claim Tokens</DFButton>
		</DFCell>
	</div>
}

const _Page: FC = () => {
	const { isConnected } = useAppKitAccount();
	const { open } = useAppKit();
	const dfBalance = useDFBalance();

	return <div id="GameCenter_WalletPage" className="w-full h-full flex flex-col px-4 pt-4 gap-4">
		<ProfileHeader />
		<div className="w-full items-center justify-between flex flex-row gap-4">
			{
				(isConnected ? <appkit-button balance="show" /> : <div className="w-full flex flex-col gap-2"> <DFButton
					onClick={() => {
						open({
							view: "Connect"
						});
					}}
				>Connect Your Wallet</DFButton></div>)
			}
			{
				(isConnected ? <div className="flex flex-row items-center justify-end gap-2 pr-2">
					<DFImage disableBackground size={30} src={iconDashFun}></DFImage>
					{
						(dfBalance?.loading ? <Spinner size="m" /> : <DFText weight="2" size="m">{parseFloat(dfBalance?.amount || "0").toFixed(2)} DFUN</DFText>)
					}

				</div> : <></>)
			}
		</div>
		<TGECountDown />
		<VestingInfo />
		<ClaimCell />
	</div>
}


const VestingInfo: FC = () => {
	const airdropData = useAirdropData();


	const ReceivedToken: FC<{ amount: string }> = ({ amount }) => {

		if (amount == "0") return <></>;
		const numAmount = parseFloat(amount);

		return <DFCell mode="primary">
			<div className="w-full flex flex-col items-start justify-start gap-2 py-2 px-4">
				<div className="w-full flex flex-row items-center justify-start gap-2">
					<DFText weight="1" size="xl">
						You've received
					</DFText>
					<DFunLabel amount={roundToTwoDecimals(amount)} />
					<DFText weight="1" size="m"  >
						through XP.
					</DFText>
				</div>
				<div className="w-full flex flex-row items-center justify-start gap-2">
					<DFunLabel amount={roundToTwoDecimals(trimTrailingZeros((numAmount * 0.2).toFixed(8)))} />
					<DFText weight="1" size="m" className="break-words w-full min-w-0 whitespace-pre-line text-wrap text-left">
						will be unlocked at TGE. You can claim them after airdrop starts.
					</DFText>
				</div>
				<div className="w-full flex flex-row items-center justify-start gap-2">
					<DFunLabel amount={roundToTwoDecimals(trimTrailingZeros((numAmount * 0.8).toFixed(8)))} />
					<DFText weight="1" size="m">
						will be locked for 3 months
					</DFText>
				</div>
				<div className="w-full flex flex-row items-center justify-start gap-2">
					<DFText weight="1" size="m" >
						and then linearly vested over 6 months.
					</DFText>
				</div>
			</div>
		</DFCell>
	}


	return <div className="w-full flex flex-col items-center justify-center gap-2 ">
		<DFText weight="1" size="lg" className="w-full text-center">
			{
				(airdropData?.token_amount == "0" ? `Unfortunately, you did not receive any DFUN tokens in this campaign. Thank you for participating!` :
					<ReceivedToken amount={airdropData?.token_amount || "0"} />)
			}
		</DFText>
	</div>
}

const DFunLabel: FC<{ amount: string }> = ({ amount }) => {
	if (amount == "0") return <></>;

	return <div className="flex flex-row items-center justify-start gap-2">
		<DFText weight="3" size="lg" >
			{trimTrailingZeros(amount)}
		</DFText>
		<DFImage disableBackground size={30} src={iconDashFun}></DFImage>
	</div>
}

const ClaimCell: FC = () => {
	const lp = useLaunchParams();
	const initDataRaw = lp.initDataRaw;
	const { address, isConnected } = useAppKitAccount();
	const { open } = useAppKit();
	const airdropData = useAirdropData();
	const vestingInfo = useVestingInfo();
	const userClaimTokens = useUserClaimTokens();
	const updateVestingInfo = useUpdateVestingInfo();
	const updateAirdropData = useUpdateAirdropData();

	const waitingForTransaction = useWaitingForTransaction();

	const [error, setError] = useState<string>("");
	const [claimTx, setClaimTx] = useState<string>("");
	const [kcUid, setKcUid] = useState<string>("");


	const claimTokens = async () => {
		if (!isConnected || address == null || address == "") {
			//用户未连接钱包
			setError("Please connect your wallet first.");
			return;
		}

		if (claimTx != "") {
			setError("Transaction is already in progress.");
			return;
		}

		if (vestingInfo.total != "0" && vestingInfo.claimable == "0") {
			setError("You have no claimable tokens at this time.");
			return;
		}

		if (parseFloat(vestingInfo.total) == 0) {
			setClaimTx("loading");
			//向服务器请求，建立vesting
			try {
				await AirdropApi.claim(initDataRaw as string, address as string, kcUid)
				const req = await waitingForRequest(initDataRaw as string);

				if (req == null || req.existed == false || req.request == null) {
					setError("Failed to claim tokens. Please try again later.");
					setClaimTx("");
					return;
				}
				const tx = req.request.result;
				setClaimTx(tx);
				setError("");
				//等待交易完成
				await waitingForTransaction(tx);
				setClaimTx("");
				updateAirdropData();
			} catch (e) {
				console.error("Error claiming tokens:", e);
				setError(e instanceof Error ? e.message : e as string);
				setClaimTx("");
				return;
			}
		} else {
			//调用合约的claim
			setClaimTx("loading");
			try {
				setError("");
				await userClaimTokens();
				setClaimTx(""); // Reset claimTx after successful claim
				updateVestingInfo();
			} catch (e: Error | any) {
				console.error("Error claiming tokens:", e);
				setError("Failed to claim tokens. Please try again later.");
				setClaimTx("");
				return;
			}
		}
	}

	const cellContent = isConnected ? <div className="w-full flex flex-col items-center justify-center gap-2 py-2 px-4">
		{
			(vestingInfo.loading ? <Spinner size="m" /> : <>
				{(
					(parseFloat(vestingInfo.total) != 0) &&
					< div className="w-full flex flex-col items-center gap-2">
						<div className="w-full flex flex-row items-center justify-center gap-4">
							<DFText size="m" weight="1">
								Total Received: {roundToTwoDecimals(vestingInfo.total)}
							</DFText>
							<DFText size="m" weight="1">
								Claimed: {roundToTwoDecimals(vestingInfo.claimed)}
							</DFText>
						</div>
						<DFText size="lg" weight="3">
							Claimable: {roundToTwoDecimals(vestingInfo.claimable)}
						</DFText>
					</div>)}
				{
					(
						(parseFloat(vestingInfo.total) != 0 && vestingInfo.total == vestingInfo.claimed) ?
							<DFText size="lg" weight="3" >All done! You’ve already claimed every token.</DFText> :
							<div className="flex flex-col items-center justify-center gap-4 w-full">
								{(airdropData != null &&
									(airdropData.start_time * 1000 > Date.now() || airdropData.ku_coin_id != "") &&
									<div className="flex flex-col items-center justify-center gap-2 w-full">
										<Input
											id="inputKCUid"
											placeholder="KuCoin UID (Optional)"
											defaultValue={airdropData?.ku_coin_id || ""}
											before={<img src={kcLogo} className="h-6" />}
											readOnly={(airdropData != null && airdropData.ku_coin_id != "")}
											onChange={(e) => {
												setKcUid(e.target.value);
											}}
										/>
										{(airdropData.ku_coin_id == "" && <DFText size="sm" weight="1" className="text-center">
											Don't have a KuCoin Account? <a href={kc_signup_url} target="_blank" className="text-blue-300 underline">Sign up here</a>.
										</DFText>)}
									</div>
								)}
								{((kcUid != "" || (airdropData != null && airdropData.ku_coin_id != "")) && <div className="w-full flex flex-col items-center justify-center gap-2">
									<DFInfoLabel rounded="lg">
										<DFText
											size="sm"
											weight="1"
											className="px-4 py-2 break-words w-full min-w-0 whitespace-pre-line text-wrap"
										>
											<div className="w-full">
												You have provided your KuCoin UID, the tokens unlocked at TGE (
												<DFText size="m" weight="3" className="inline">
													{roundToTwoDecimals(trimTrailingZeros(((airdropData?.token_amount ? parseFloat(airdropData.token_amount) : 0) * 0.2).toFixed(8)))}
												</DFText>
												<img src={iconDashFun} className="inline h-8 mb-2" />
												) will be distributed by
												<img src={kcLogo} className="h-5 inline mb-1 mx-1" />
												, approximately 5 hours after the TGE at&nbsp;
												{airdropData?.start_time
													? new Date((airdropData.start_time + 5 * 3600) * 1000)
														.toISOString()
														.replace('T', ' ')
														.substring(0, 16) + " UTC"
													: ""}.
											</div>
										</DFText>
									</DFInfoLabel>
									{(airdropData != null && (airdropData.start_time * 1000 > Date.now() && !airdropData.claimed) && <div className="w-full">
										<DFLabel rounded="lg">
											<DFText
												size="sm"
												weight="1"
												className="px-4 py-2 break-words w-full min-w-0 whitespace-pre-line text-wrap"
											>
												Please make sure your UID is correct, otherwise you may lose your tokens.
											</DFText>
										</DFLabel>
									</div>)}
								</div>)}
								<DFButton size="m" loading={claimTx != ""} disabled={claimTx != ""
									|| (airdropData?.claimed && parseFloat(vestingInfo.total) != 0 && parseFloat(vestingInfo.claimable) == 0)
									|| (airdropData?.claimed && parseFloat(vestingInfo.total) != 0 && vestingInfo.total == vestingInfo.claimed)
								}
									onClick={() => {
										claimTokens();
									}}
								>
									Claim Your Tokens
								</DFButton>
								{(
									claimTx != "" && claimTx != "loading" && <DFInfoLabel rounded="md">
										<DFText size="sm" weight="1" className="px-3 py-1">
											Transaction sent! Waiting for confirmation...
										</DFText>
										<DFText size="sm" weight="1" className="px-3 py-1">
											TX Hash: <a href={getTxLink(claimTx)} target="_blank" className="text-blue-300 underline">{claimTx.slice(0, 6) + "..." + claimTx.slice(-6)}</a>
										</DFText>
									</DFInfoLabel>
								)}
							</div>
					)
				}
				{
					(
						error != "" && <DFLabel>
							<DFText size="sm" weight="1" className="px-3 py-1">{error}</DFText>
						</DFLabel>
					)
				}
				{
					(
						(airdropData != null && airdropData.claim_address && address != airdropData.claim_address) &&
						<div className="w-full flex flex-col">
							<DFLabel rounded="lg">
								<div className="w-full flex flex-col items-center justify-center gap-2 px-2 py-2">
									<DFText size="sm" weight="3" >
										The connected wallet {address?.slice(0, 4)}...{address?.slice(-6)}
									</DFText>
									<DFText size="sm" weight="3" className="">
										doesn’t match the address  {
											airdropData?.claim_address
												? `${airdropData.claim_address.slice(0, 4)}...${airdropData.claim_address.slice(-6)}`
												: ""
										}
									</DFText>
									<DFText size="sm" weight="3" className="">
										used to claim your tokens.
									</DFText>
								</div>
							</DFLabel>
						</div>)
				}
			</>)
		}
	</div > : <div className="w-full flex flex-col items-center justify-center gap-2 py-2 px-4">
		<DFText weight="2" size="lg" className="w-full text-center">
			Connect your wallet to claim your tokens.
		</DFText>
		<DFButton
			onClick={() => {
				open({
					view: "Connect"
				});
			}}
		>Connect Your Wallet</DFButton>
	</div>;

	if (airdropData?.token_amount == "0") {
		//没有token可领取
		return null;
	}

	return <div className="w-full flex flex-col items-center justify-center gap-2">
		<DFCell mode="primary">
			{cellContent}
		</DFCell></div>
}

function trimTrailingZeros(numStr: string): string {
	if (!numStr.includes('.')) return numStr;
	return numStr.replace(/(\.\d*?[1-9])0+$/g, '$1').replace(/\.0+$/, '').replace(/\.$/, '');
}

function roundToTwoDecimals(numStr: string): string {
	const num = parseFloat(numStr);
	if (isNaN(num)) return "0.00";
	return num.toFixed(2);
}

async function waitingForRequest(token: string): Promise<AirdropVestingRequest | null> {
	let req: AirdropVestingRequest | null = null;

	do {
		await sleep(2000); // 等待2秒
		req = await AirdropApi.myRequest(token);
		if (req == null || req.existed == false || req.request == null) {
			return { existed: false, request: null };
		}
		console.log("Waiting for request to be ready...", req);
		if (req.request.status == 3) { //Done
			//请求已完成
			return req;
		} else if (req.request.status == 4) { //Failed
			//请求失败
			throw new Error("Request failed: " + req.request.result);
		}
	} while (req != null && req.request != null && req.request.status != 3 && req.request.status != 4);

	return null;
}

function getTxLink(txHash: string): string {
	let url = "https://testnet.bscscan.com/tx/";
	if (getEnv() == Env.Prod) {
		url = "https://bscscan.com/tx/";
	}
	return `${url}${txHash}`;
}