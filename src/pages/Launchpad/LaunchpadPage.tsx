import { FC } from 'react';
import { FeaturedPoolCard } from './components/FeaturedPoolCard';
import { PoolList } from './components/PoolList';
import { Wallet, Settings } from 'lucide-react';

export const LaunchpadPage: FC = () => {
	return (
		<div className="min-h-screen w-full bg-defi-bg-base text-white pb-24">
			{/* Header */}
			<div className="pt-6 px-5 pb-4 bg-gradient-to-b from-defi-card-bg to-defi-bg-base">
				<div className="flex justify-between items-start mb-6">
					<div>
						<div className="flex items-center gap-2 text-green-400 text-xs font-bold mb-1">
							<div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
							Wallet Connected
						</div>
						<h1 className="text-2xl font-bold">Hello, Alex</h1>
					</div>
					<div className="flex gap-3">
						<button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
							<Wallet size={20} className="text-defi-text-muted" />
						</button>
						<button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
							<Settings size={20} className="text-defi-text-muted" />
						</button>
					</div>
				</div>
			</div>

			<div className="px-5 space-y-8 mt-2">
				{/* Featured Section */}
				<section>
					<h2 className="text-lg font-bold mb-4 flex items-center gap-2">
						Featured Pool
						<span className="w-1.5 h-1.5 rounded-full bg-defi-accent-blue" />
					</h2>
					<FeaturedPoolCard
						name="Aura Network"
						ticker="AURA"
						raised={1250000}
						target={1500000}
					/>
				</section>

				{/* Upcoming Section */}
				<section>
					<h2 className="text-lg font-bold mb-4">Upcoming Pools</h2>
					<PoolList />
				</section>
			</div>

			{/* Decorative Glow */}
			<div className="fixed top-0 left-0 w-full h-[300px] bg-defi-accent-blue/10 blur-[100px] pointer-events-none" />
		</div>
	);
};

export default LaunchpadPage;
