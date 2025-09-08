
import { createAppKit } from '@reown/appkit/react'
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { AppKitNetwork, bsc, bscTestnet } from '@reown/appkit/networks'
import { useAppKit } from "@reown/appkit/react";
import { FC } from 'react';
import { Env, getEnv } from '@/utils/DashFunApi';

// 1. Get projectId
const projectId = '0cbed54d6cddbb99a52e4fc4a6f209c4';

// 2. Set the networks

const networks: [AppKitNetwork, ...AppKitNetwork[]] = [bsc];

if (getEnv() != Env.Prod) {
	networks.push(bscTestnet);
}

// 3. Create a metadata object - optional
const metadata = {
	name: 'DashFun',
	description: '',
	url: 'https://app.dashfun.games', // origin must match your domain & subdomain
	icons: ['https://res.dashfun.games/icons/dashfun-icon-256.png']
}

// 4. Create a AppKit instance
createAppKit({
	adapters: [new EthersAdapter()],
	networks,
	metadata,
	projectId,
	features: {
		analytics: true // Optional - defaults to your Cloud configuration
	}
})

const ConnectButton: FC = () => {
	// 4. Use modal hook
	const { open } = useAppKit();
	return <>
		<button onClick={() => open()}>Open Connect Modal</button>
		<button onClick={() => open({ view: "Networks" })}>
			Open Network Modal
		</button>
	</>
}

export default ConnectButton;