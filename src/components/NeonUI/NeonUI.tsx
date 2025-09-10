// NeonUI.tsx
import React from "react";

/** ---------- Tokens (可按需调整配色) ---------- */
const GRADIENT = "bg-[linear-gradient(135deg,#00E5FF_0%,#7C4DFF_50%,#FF6EC7_100%)]";
const PANEL = "rounded-2xl bg-slate-900/80 backdrop-blur-xl ring-1 ring-white/10";
const GLOW = "shadow-[0_0_24px_rgba(124,77,255,0.35)]";

const GRAD = "bg-[linear-gradient(135deg,#00E5FF_0%,#7C4DFF_50%,#FF6EC7_100%)]";
const PANEL_PRIMARY =
	"rounded-[14px] bg-slate-900/80 backdrop-blur-xl ring-1 ring-white/10 text-slate-100";
const PANEL_PLAIN =
	"rounded-[12px] bg-white/5 hover:bg-white/8 active:bg-white/[0.12] " +
	"ring-1 ring-white/10 text-white/90";

/** ---------- NeonCard ---------- */
export interface NeonCardProps {
	className?: string;
	glowOnHover?: boolean;
	children?: React.ReactNode;
}

export const NeonCard: React.FC<NeonCardProps> = ({
	className = "",
	glowOnHover = true,
	children,
}) => {
	return (
		<div className={`relative rounded-2xl p-[1px] ${GRADIENT} ${className}`}>
			<div className={`${PANEL}`}>
				{/* 底光层（可选更强发光） */}
				<div
					className={`absolute inset-0 -z-10 rounded-2xl blur-2xl
          bg-[radial-gradient(60%_60%_at_50%_0%,rgba(124,77,255,0.35),transparent)]
          ${glowOnHover ? "opacity-40 hover:opacity-70 transition-opacity" : "opacity-40"}`}
				/>
				{children}
			</div>
		</div>
	);
};
// NeonButton.tsx

export interface NeonButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	loading?: boolean;
	asBlock?: boolean;                 // 占满整行
	mode?: "primary" | "plain";        // ✅ 新增
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
}

export const NeonButton: React.FC<NeonButtonProps> = ({
	children,
	disabled,
	loading = false,
	asBlock = false,
	mode = "primary",
	leftIcon,
	rightIcon,
	className = "",
	...rest
}) => {
	const isDisabled = disabled || loading;

	if (mode === "plain") {
		// ————— 次要按钮：无霓虹描边/弱 Glow/更克制的交互 —————
		return (
			<button
				{...rest}
				disabled={isDisabled}
				className={[
					"relative",
					asBlock ? "w-full" : "inline-flex",
					"items-center justify-center gap-2 px-4 py-2.5",
					"rounded-[12px]",
					PANEL_PLAIN,
					isDisabled
						? "opacity-60 cursor-not-allowed"
						: "transition-colors",
					className,
				].join(" ")}
			>
				{leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
				<span className="text-sm font-medium">
					{loading ? "Loading…" : children}
				</span>
				{rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
			</button>
		);
	}

	// ————— 主按钮：原有霓虹渐变边框 + Glow —————
	return (
		<button
			{...rest}
			disabled={isDisabled}
			className={[
				"relative rounded-2xl p-[2px]",
				GRAD,
				isDisabled
					? "opacity-60 cursor-not-allowed"
					: "hover:scale-[0.99] active:scale-[0.98] transition-transform",
				asBlock ? "w-full" : "inline-flex",
				className,
			].join(" ")}
		>
			<span
				className={[
					"relative flex items-center justify-center gap-2 px-5 py-2.5",
					asBlock ? "w-full" : "",
					PANEL_PRIMARY,
				].join(" ")}
			>
				{leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
				<span className="text-sm font-semibold">
					{loading ? "Loading…" : children}
				</span>
				{rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
			</span>
			<span className={`pointer-events-none absolute inset-0 rounded-2xl ${GLOW}`} />
		</button>
	);
};


// NeonListItem.tsx (TS + React + Tailwind)

export interface NeonListItemProps {
	/** 兼容旧版：圆徽标文字（有 leftSlot 则忽略） */
	leftBadge?: string;
	/** 自定义左侧内容（头像/图标等） */
	leftSlot?: React.ReactNode;
	/** 右侧自定义区域（倒计时/按钮/图标组等） */
	rightHint?: React.ReactNode;
	/** 主文本 */
	text: string;
	/** 点击 */
	onClick?: () => void;
	/** 外层自定义类名 */
	className?: string;
	/** 是否禁用交互 */
	disabled?: boolean;
	/** 密度 */
	padding?: "sm" | "md" | "lg";
	/** 新增：外观模式（plain / highlight）*/
	mode?: "plain" | "highlight";
	/** 可访问性：选中态 */
	selected?: boolean;
}

const BASE_GRAD =
	"bg-[linear-gradient(135deg,#00E5FF_0%,#7C4DFF_50%,#FF6EC7_100%)]";
const BASE_PANEL = "rounded-2xl bg-slate-900/80 backdrop-blur-xl ring-1 ring-white/10";

/** 高亮模式的更强边框与柔光 */
const HL_GRAD =
	"bg-[conic-gradient(from_20deg,#00E5FF,#7C4DFF,#FF6EC7,#00E5FF)]";
const HL_GLOW =
	"shadow-[0_0_36px_rgba(124,77,255,0.55),0_0_12px_rgba(0,229,255,0.35)]";
const HL_PANEL =
	"rounded-2xl bg-slate-900/70 backdrop-blur-xl ring-1 ring-cyan-300/30";

/** 圆徽标（保留旧版视觉） */
const Badge: React.FC<{ text: string }> = ({ text }) => (
	<div className="relative h-9 w-9 rounded-full p-[1px]
      bg-[conic-gradient(from_30deg,#7C4DFF,#00E5FF,#FF6EC7,#7C4DFF)]">
		<div className="h-full w-full rounded-full bg-slate-900/85 ring-1 ring-white/10 grid place-items-center">
			<span className="text-xs text-cyan-200 font-semibold">{text}</span>
		</div>
	</div>
);

export const NeonListItem: React.FC<NeonListItemProps> = ({
	leftBadge,
	leftSlot,
	rightHint,
	text,
	onClick,
	className = "",
	disabled = false,
	padding = "md",
	mode = "plain",
	selected = false,
}) => {
	const pad =
		padding === "sm" ? "px-3 py-2" : padding === "lg" ? "px-6 py-4" : "px-4 py-3";
	const interactive = !!onClick && !disabled;

	// —— 外层边框 & glow
	const outer =
		mode === "highlight"
			? `relative w-full rounded-2xl p-[2px] ${HL_GRAD} ${HL_GLOW}`
			: `relative w-full rounded-2xl p-[1px] ${BASE_GRAD}`;

	// —— 内层面板
	const inner =
		mode === "highlight"
			? `${HL_PANEL} ${pad} w-full`
			: `${BASE_PANEL} ${pad} w-full`;

	const inter =
		interactive
			? "cursor-pointer hover:scale-[0.999] active:scale-[0.995] transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
			: "";

	// —— 柔光层（高亮更明显）
	const glowLayer =
		mode === "highlight"
			? "bg-[radial-gradient(60%_60%_at_50%_0%,rgba(0,229,255,0.35),transparent)] opacity-70"
			: "bg-[radial-gradient(60%_60%_at_50%_0%,rgba(124,77,255,0.35),transparent)] opacity-40";

	const Comp: any = onClick ? "button" : "div";

	return (
		<Comp
			type={onClick ? "button" : undefined}
			onClick={onClick}
			disabled={disabled}
			aria-selected={selected || mode === "highlight"}
			className={[
				outer,
				disabled ? "opacity-60 cursor-not-allowed" : "",
				className,
			].join(" ")}
		>
			<div className={[inner, inter, "relative rounded-2xl"].join(" ")}>
				{/* 背景柔光 */}
				<div
					className={`absolute inset-0 -z-10 rounded-2xl blur-2xl ${glowLayer} transition-opacity`}
				/>
				{/* 内容 */}
				<div className="flex items-center justify-between gap-3">
					<div className="flex items-center gap-3">
						{leftSlot ? leftSlot : leftBadge ? <Badge text={leftBadge} /> : null}
						<p
							className={
								mode === "highlight"
									? "text-slate-100 font-medium"
									: "text-slate-100"
							}
						>
							{text}
						</p>
					</div>
					{rightHint && <div className="shrink-0">{rightHint}</div>}
				</div>
			</div>
		</Comp>
	);
};



/** ---------- 辅助：渐变文字 ---------- */
export const neonTextClass =
	"bg-clip-text text-transparent bg-[linear-gradient(90deg,#7DF9FF,#C084FC,#FF8BD1)]";
