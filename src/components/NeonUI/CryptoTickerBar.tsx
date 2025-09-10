// CryptoTickerBanner.tsx
import React from "react";

/* ===== Tokens ===== */
const GRAD = "bg-[linear-gradient(135deg,#00E5FF_0%,#7C4DFF_50%,#FF6EC7_100%)]";
const PANEL = "rounded-[22px] bg-slate-950/75 backdrop-blur-xl ring-1 ring-white/10";
const GLOW = "shadow-[0_0_36px_rgba(124,77,255,0.45)]";

/* ===== Types ===== */
export type Ticker = {
	symbol: "BTC" | "ETH" | string;
	price: number;
	change24h: number;   // e.g. 1.2 / -0.8
	volume24h: number;   // USD
	brife?: string;
	iconUrl?: string;
};

export interface CryptoTickerBannerProps {
	left: Ticker;   // BTC
	right: Ticker;  // ETH
	live?: boolean;
	className?: string;
}

/* ===== Utils ===== */
const fmtUSD0 = (n: number) =>
	new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const fmtPct = (n: number) =>
	`${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;

const fmtVol = (n: number) => {
	if (n >= 1e12) return (n / 1e12).toFixed(1) + "T";
	if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
	if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
	return n.toLocaleString();
};

const Arrow = ({ up }: { up: boolean }) => (
	<svg viewBox="0 0 16 16" className={`h-4 w-4 ${up ? "text-emerald-400" : "text-rose-400"}`} fill="currentColor">
		{up ? <path d="M8 2l5.5 7h-4v5h-3v-5h-4L8 2z" /> : <path d="M8 14l-5.5-7h4V2h3v5h4L8 14z" />}
	</svg>
);

/* ===== Sub-Block (matches mock) ===== */
function TickerBlock({ t }: { t: Ticker }) {
	const up = t.change24h >= 0;
	return (
		<div className="w-full flex flex-col items-start gap-2">
			<div className="flex w-full gap-4 items-center justify-between">
				{/* Left: icon + symbol */}
				<div className="flex items-center gap-3 md:gap-4">
					<div className="h-12 w-12 rounded-full bg-white/10 ring-1 ring-white/20 grid place-items-center">
						{t.iconUrl ? (
							<img src={t.iconUrl} alt={t.symbol} className="h-11 w-11" />
						) : (
							<span className="text-sm font-semibold text-cyan-200">{t.symbol}</span>
						)}
					</div>
					<div className="space-y-0.5 flex flex-col items-start">
						<div className="flex items-center gap-1">
							<div className="text-cyan-200/90 text-2xl font-semibold tracking-wide">{t.symbol}</div>
							<div className="text-slate-100 text-2xl font-bold tabular-nums tracking-tight">
								{fmtUSD0(t.price)}
							</div>
						</div>

						<div className="flex items-center gap-2">
							<div className="text-xs md:text-sm text-white/60">24H VOLUME</div>
							<div className="text-slate-200 tabular-nums">{fmtVol(t.volume24h)}</div>
						</div>
					</div>
				</div>



				{/* Right: change + volume */}
				<div className="flex items-center justify-end gap-2 ">
					<div className={`flex items-center gap-1.5 text-sm md:text-base ${up ? "text-emerald-400" : "text-rose-400"}`}>
						<Arrow up={up} />
						<span className="tabular-nums">{fmtPct(t.change24h)}</span>
					</div>
				</div>
			</div>
			{t.brife && <div className="text-sm text-white/70">{t.brife}</div>}
		</div>
	);
}

/* ===== Main ===== */
export const CryptoTickerBanner: React.FC<CryptoTickerBannerProps> = ({
	left,
	right,
	live = true,
	className = "",
}) => {
	return (
		<div className={`relative w-full rounded-[26px] p-[3px] ${GRAD} ${GLOW} ${className}`}>
			<div className={`${PANEL}`}>
				{/* LIVE dot */}
				{live && (
					<div className="absolute right-5 top-4 flex items-center gap-2 text-cyan-300">
						<span className="relative flex h-2.5 w-2.5">
							<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400/60" />
							<span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400" />
						</span>
						<span className="text-xs">LIVE</span>
					</div>
				)}

				{/* Inner panel */}
				<div className="rounded-[20px] border border-white/10 bg-slate-900/40 px-4 py-4 md:px-8 md:py-6">
					<div className="flex flex-col items-center justify-between gap-6 md:gap-12">
						{/* Left (BTC) */}
						<TickerBlock t={left} />

						{/* Divider on desktop (like the mock) */}
						{/* <div className="hidden md:block absolute left-1/2 top-4 bottom-4 w-px bg-white/10" /> */}

						{/* Right (ETH) */}
						<TickerBlock t={right} />
					</div>
				</div>
			</div>

			{/* soft glow */}
			<div className="pointer-events-none absolute inset-0 -z-10 rounded-[26px] blur-2xl
        bg-[radial-gradient(60%_60%_at_50%_0%,rgba(124,77,255,0.35),transparent)] opacity-60" />
		</div>
	);
};
