type DFTextProps = {
    children: React.ReactNode;
    onClick?: React.MouseEventHandler | undefined;
    size?: "xs" | "sm" | "m" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
    weight: "1" | "2" | "3"
    color?: string;
    className?: string;
}

const sizeMap = {
    xs: { fontSize: "12px", lineHeight: "16px" },
    sm: { fontSize: "14px", lineHeight: "20px" },
    m: { fontSize: "16px", lineHeight: "24px" },
    lg: { fontSize: "18px", lineHeight: "28px" },
    xl: { fontSize: "20px", lineHeight: "28px" },
    "2xl": { fontSize: "24px", lineHeight: "32px" },
    "3xl": { fontSize: "30px", lineHeight: "36px" },
    "4xl": { fontSize: "36px", lineHeight: "40px" },
    "5xl": { fontSize: "48px", lineHeight: 1 },
}

const DFText: React.FC<DFTextProps> = ({ children, onClick, weight, size = "sm", color = "white", className }) => {

    let fontWeight = 400;
    switch (weight) {
        case "1":
            fontWeight = 400;
            break;
        case "2":
            fontWeight = 600;
            break;
        case "3":
            fontWeight = 700;
            break;
        default:
            fontWeight = 400;
    }

    return <div className={`${className == null ? "" : className}`} style={{
        fontWeight: fontWeight,
        color: color,
        ...sizeMap[size],
    }}
        onClick={onClick}>
        {children}
    </div>
}

export default DFText;
export type { DFTextProps }