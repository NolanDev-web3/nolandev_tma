interface DFProgressBarProps {
	size?: number;
	progress: number; // 0 ~ 1
	backgroundColor?: string;
	progressColor?: string;
}

const DFProgressBar: React.FC<DFProgressBarProps> = ({
	size = 56,
	progress,
	backgroundColor = "#00355B40",
	progressColor = "#FBD43A",
}) => {
	if (progress > 1) progress = 1;
	if (progress < 0) progress = 0;
	return <div className="rounded-full h-2 relative" style={{
		width: size,
		backgroundColor: backgroundColor,
	}}>
		<div className="rounded-full h-2 absolute left-0 top-0 bottom-0" style={{
			width: progress * size,
			backgroundColor: progressColor,
			transition: "width 0.4s ease"
		}}></div>
	</div>
}

export default DFProgressBar;
export type { DFProgressBarProps }

