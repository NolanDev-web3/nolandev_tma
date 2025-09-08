interface DFProgressCircleProps {
    size?: number;
    strokeWidth?: number;
    progress: number; // 0 ~ 1
    backgroundColor?: string;
    progressColor?: string;
}

const DFProgressCircle: React.FC<DFProgressCircleProps> = ({
    size = 56,
    strokeWidth = 4,
    progress,
    backgroundColor = "#00355B",
    progressColor = "#FBD43A",
}) => {
    const center = size / 2;
    const radius = center - strokeWidth;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - progress);

    return (
        <div className="rotate-[-90deg]">
            <svg width={size} height={size} className="block">
                {/* 背景圆环 */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={backgroundColor}
                    strokeOpacity={0.2}
                    strokeWidth={strokeWidth}
                    fill="none"
                />

                {/* 进度圆环 */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={progressColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{ transition: "stroke-dashoffset 0.4s ease" }}
                />
            </svg>
        </div>
    );
};

export default DFProgressCircle;
export type { DFProgressCircleProps };