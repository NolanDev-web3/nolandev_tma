import React from "react";

interface DFBadgeProps {
    children: React.ReactNode; // 可传任意文字或元素
    position?: "top-right" | "bottom-right" | "top-left" | "bottom-left";
    color?: "gray" | "red" | "custom"; // 支持更多颜色可扩展
    className?: string;
    style?: React.CSSProperties;
}

const positionMap: Record<string, string> = {
    "top-right": "top-0 right-0 translate-x-1/2 -translate-y-1/2",
    "bottom-right": "bottom-0 right-0 translate-x-1/2 translate-y-1/2",
    "top-left": "top-0 left-0 -translate-x-1/2 -translate-y-1/2",
    "bottom-left": "bottom-0 left-0 -translate-x-1/2 translate-y-1/2",
};

const colorClassMap: Record<string, string> = {
    gray: "bg-gray-500 text-white",
    red: "bg-red-500 text-white",
    custom: "", // 用 style 或 className 控制
};

const DFBadge: React.FC<DFBadgeProps> = ({
    children,
    position = "top-right",
    color = "gray",
    className = "",
    style = {},
}) => {
    if (!children) return null;

    return (
        <span
            className={`absolute text-xs px-2 py-0.5 rounded-full whitespace-nowrap
        ${positionMap[position]} ${colorClassMap[color]} ${className}`}
            style={style}
        >
            {children}
        </span>
    );
};

export default DFBadge;
export type { DFBadgeProps };
