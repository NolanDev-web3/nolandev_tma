import { FC } from 'react';
import { ProgressBar } from './ProgressBar';
import { ChevronRight } from 'lucide-react';

interface FeaturedPoolCardProps {
	name: string;
	ticker: string;
	logoUrl?: string; // Optional, placeholder used if missing
	raised: number;
	target: number;
}

export const FeaturedPoolCard: FC<FeaturedPoolCardProps> = ({ name, ticker, raised, target }) => {
	const percentage = (raised / target) * 100;

	return (
		<div className="relative group rounded-2xl p-[1px] bg-gradient-to-br from-defi-accent-blue/30 to-defi-accent-purple/30 hover:from-defi-accent-blue/60 hover:to-defi-accent-purple/60 transition-all duration-300">
			<div className="absolute inset-0 bg-gradient-to-br from-defi-accent-blue/10 to-defi-accent-purple/10 blur-xl opacity-50" />

			<div className="relative bg-defi-card-bg/90 backdrop-blur-md rounded-2xl p-5 border border-white/5 shadow-xl">
				{/* Header */}
				<div className="flex items-center gap-4 mb-6">
					<div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-xl font-bold text-defi-bg-base shrink-0">
						{/* Placeholder Logo if no URL */}
						{ticker[0]}
					</div>
					<div>
						<h3 className="text-white text-lg font-bold">{name}</h3>
						<span className="text-defi-text-muted text-sm font-medium">{ticker}</span>
					</div>
					<div className="ml-auto px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/30 animate-pulse">
						LIVE
					</div>
				</div>

				{/* Stats */}
				<div className="space-y-4">
					<div className="flex justify-between items-end text-sm">
						<span className="text-defi-text-muted">Raised</span>
						<div className="text-right">
							<span className="text-white font-semibold">${raised.toLocaleString()}</span>
							<span className="text-defi-text-muted text-xs"> / ${target.toLocaleString()}</span>
						</div>
					</div>

					<ProgressBar progress={percentage} />

					<div className="flex justify-between text-xs text-defi-text-muted mt-1">
						<span>{percentage.toFixed(1)}%</span>
						<span>Target Reached</span>
					</div>
				</div>

				{/* Action */}
				<button className="w-full mt-6 bg-gradient-to-r from-defi-accent-blue to-defi-accent-purple text-white font-bold py-3.5 rounded-xl hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all active:scale-[0.98] flex items-center justify-center gap-2">
					Join Pool <ChevronRight size={18} />
				</button>
			</div>
		</div>
	);
};
