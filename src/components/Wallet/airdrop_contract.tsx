import { useAppKitAccount, useAppKitNetwork, useAppKitProvider } from "@reown/appkit/react";
import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { BrowserProvider, Contract, Eip1193Provider, formatUnits } from "ethers";
import { AirdropApi, AirdropData } from "@/utils/DashFunApi";
import { useDashFunUser } from "../DashFun/DashFunUser";
import { useLaunchParams } from "@telegram-apps/sdk-react";

const ERC20 = [
	"function name() view returns (string)",
	"function symbol() view returns (string)",
	"function balanceOf(address) view returns (uint)",
	"function transfer(address to, uint amount)",
	"event Transfer(address indexed from, address indexed to, uint amount)",
];

const VestingAbi = [
	"function getVestingInfo(address) view returns (uint256, uint256, uint256)",
	"function claim()",
]

type TokenBalance = {
	amount: string;
	loading: boolean;
}

type VestingInfo = {
	total: string;
	claimed: string;
	claimable: string;
	loading: boolean;
}

const Web3Context = createContext<{
	airdropData: AirdropData | null,
	dfBalance: TokenBalance | null,
	vestingInfo: VestingInfo,
	userClaimTokens: () => Promise<string>,
	updateVestingInfo: () => Promise<void>,
	updateAirdropData: () => Promise<void>;
} | null>(null);


export const Web3Provider = ({ children }: PropsWithChildren<{}>) => {
	const lp = useLaunchParams();
	const initDataRaw = lp.initDataRaw;
	const user = useDashFunUser();
	const { walletProvider } = useAppKitProvider<Eip1193Provider>("eip155");
	const { address, isConnected } = useAppKitAccount();
	const network = useAppKitNetwork();
	const [airdropData, setAirdropData] = useState<AirdropData | null>(null);

	const [dfBalance, setDFBalance] = useState<string>("0");
	const [dfLoading, setDFLoading] = useState<boolean>(false);

	const [vestingInfo, setVestingInfo] = useState<VestingInfo>({ total: "0", claimed: "0", claimable: "0", loading: false });
	const [vestingLoading, setVestingLoading] = useState<boolean>(false);

	const getBalance = async () => {
		if (!isConnected) throw Error("User disconnected");
		if (airdropData == null || airdropData.token_contract == null) {
			throw Error("Airdrop data not available");
		}
		const ethersProvider = new BrowserProvider(walletProvider);
		const signer = await ethersProvider.getSigner();
		// The Contract object
		const contract = new Contract(airdropData.token_contract, ERC20, signer);
		const balance = await contract.balanceOf(address);
		return formatUnits(balance, 18);
	}

	const fetchAirdropData = async () => {
		if (!initDataRaw) {
			console.error("No initDataRaw provided");
			return;
		}
		try {
			const data = await AirdropApi.detail(initDataRaw as string);
			setAirdropData(data);
		} catch (error) {
			console.error("Error fetching airdrop data:", error);
		}
	};

	const updateDFBalance = async () => {
		if (isConnected && address && airdropData && airdropData.token_contract) {
			setDFLoading(true);
			try {
				const balance = await getBalance();
				setDFBalance(balance);
			} catch (error) {
				setDFBalance("0");
			} finally {
				setDFLoading(false);
			}

		}
	}

	const updateVestingInfo = async () => {
		if (isConnected && address && airdropData && airdropData.vesting_contract) {
			setVestingLoading(true);
			try {
				const ethersProvider = new BrowserProvider(walletProvider);
				const signer = await ethersProvider.getSigner();
				const vestingContract = new Contract(airdropData.vesting_contract, VestingAbi, signer);
				const [total, claimed, claimable] = await vestingContract.getVestingInfo(address);
				console.log("vesting info:", { total, claimed, claimable });
				setVestingInfo({
					total: formatUnits(total, 18),
					claimed: formatUnits(claimed, 18),
					claimable: formatUnits(claimable, 18),
					loading: false
				});
			} catch (error) {
				console.error("Error fetching vesting info:", error);
				setVestingInfo({ total: "0", claimed: "0", claimable: "0", loading: false });
			} finally {
				setVestingLoading(false);
			}
		}
	}

	const userClaimTokens = async () => {
		if (!isConnected || !address) {
			throw new Error("Please connect your wallet first.");
		}
		if (vestingInfo.total !== "0" && vestingInfo.claimable === "0") {
			throw new Error("You have no claimable tokens at this time.");
		}
		if (vestingInfo.total === "0") {
			throw new Error("No vesting contract available for claiming tokens.");
		}
		if (!airdropData || !airdropData.vesting_contract) {
			throw new Error("Airdrop data or vesting contract not available.");
		}
		const ethersProvider = new BrowserProvider(walletProvider);
		const signer = await ethersProvider.getSigner();
		const vestingContract = new Contract(airdropData.vesting_contract, VestingAbi, signer);
		try {
			const tx = await vestingContract.claim();
			await tx.wait();
			return tx.hash; // Return transaction hash
		}
		catch (error) {
			console.error("Error claiming tokens:", error);
			throw new Error("Failed to claim tokens. Please try again later.");
		}
	}

	useEffect(() => {
		fetchAirdropData();
	}, [user]);

	useEffect(() => {
		updateDFBalance();
	}, [airdropData, isConnected, address, network.chainId, vestingInfo]);

	useEffect(() => {
		updateVestingInfo();
	}, [airdropData, address, isConnected, network.chainId])


	return (
		<Web3Context.Provider value={{
			airdropData,
			dfBalance: { amount: dfBalance, loading: dfLoading },
			vestingInfo: { ...vestingInfo, loading: vestingLoading },
			userClaimTokens: userClaimTokens,
			updateVestingInfo: updateVestingInfo,
			updateAirdropData: fetchAirdropData
		}}>
			{children}
		</Web3Context.Provider >
	);
}

export const useUpdateAirdropData = () => {
	const context = useContext(Web3Context);
	if (!context) {
		throw new Error("useUpdateAirdropData must be used within a Web3Provider");
	}
	return context.updateAirdropData;
}

export const useUpdateVestingInfo = () => {
	const context = useContext(Web3Context);
	if (!context) {
		throw new Error("useUpdateVestingInfo must be used within a Web3Provider");
	}
	return context.updateVestingInfo;
}

export const useDFBalance = () => {
	const context = useContext(Web3Context);
	if (!context) {
		throw new Error("useDFBalance must be used within a Web3Provider");
	}
	return context.dfBalance;
}

export const useAirdropData = () => {
	const context = useContext(Web3Context);
	if (!context) {
		throw new Error("useAirdropData must be used within a Web3Provider");
	}
	return context.airdropData;
}

export const useVestingInfo = () => {
	const context = useContext(Web3Context);
	if (!context) {
		throw new Error("useVestingInfo must be used within a Web3Provider");
	}
	return context.vestingInfo;
}

export const useUserClaimTokens = () => {
	const context = useContext(Web3Context);
	if (!context) {
		throw new Error("useUserClaimTokens must be used within a Web3Provider");
	}
	return context.userClaimTokens;
}

export const useWaitingForTransaction = () => {
	const { walletProvider } = useAppKitProvider<Eip1193Provider>("eip155");
	return async (txHash: string) => {
		if (!walletProvider) {
			throw new Error("Wallet provider is not available");
		}
		return waitingForTransaction(txHash, walletProvider);
	}
}

const waitingForTransaction = async (txHash: string, provider: Eip1193Provider) => {
	const ethersProvider = new BrowserProvider(provider);
	console.log("Waiting for transaction:", txHash);
	const txReceipt = await ethersProvider.waitForTransaction(txHash, 1);
	if (txReceipt && txReceipt.status === 1) {
		console.log("Transaction successful:", txReceipt);
		return true; // Transaction was successful
	} else {
		throw new Error("Transaction failed");
	}
}