import { FC } from 'react';
import { Calendar, ArrowUpRight } from 'lucide-react';

interface PoolItem {
	id: string;
	date: string;
	name: string;
	ticker: string;
}

const UPCOMING_DATA: PoolItem[] = [
	{ id: '1', date: 'Oct 28', name: 'NovaFi', ticker: 'NOVA' },
	{ id: '2', date: 'Nov 05', name: 'Ethereal Exchange', ticker: 'ETX' },
	{ id: '3', date: 'Nov 12', name: 'Solstice Protocol', ticker: 'SOLS' },
];

export const PoolList: FC = () => {
	return (
		<div className="space-y-3">
			{UPCOMING_DATA.map((pool) => (
				<div
					key={pool.id}
					className="flex items-center justify-between p-4 rounded-xl bg-defi-card-bg/50 border border-white/5 hover:bg-defi-card-bg transition-colors cursor-pointer group"
				>
					<div className="flex items-center gap-4">
						<div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
							<Calendar size={20} />
						</div>
						<div>
							<div className="text-white font-semibold">{pool.date}</div>
							<div className="text-sm text-defi-text-muted">{pool.name} ({pool.ticker})</div>
						</div>
					</div>

					<div className="text-defi-accent-blue opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 transform duration-300">
						<ArrowUpRight size={20} />
					</div>
				</div>
			))}
		</div>
	);
};
