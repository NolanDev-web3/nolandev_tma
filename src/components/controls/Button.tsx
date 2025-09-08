import { Spinner } from "@telegram-apps/telegram-ui";
import { FC } from "react"

interface DFButtonProps {
    onClick?: (evt: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    mode?: "plain" | "primary" | "normal" | "danger";
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    loading?: boolean;
    className?: string;
    size?: "s" | "m" | "l";
    children?: React.ReactNode;
}

const DFButton: FC<DFButtonProps> = ({ onClick, mode = "primary", type = "button", disabled = false, loading = false, size = "m", className = "", children }) => {
    const h = size == "s" ? 28 : size == "m" ? 38 : 48;
    const rounded = size == "l" ? "rounded-2xl" : "rounded-full";
    const textSize = size == "l" ? " text-2xl " : size == "m" ? " text-base " : " text-sm ";
    const invisable = loading ? " invisible " : "";

    const activeStyle = disabled ? "" : " active:shadow-none active:translate-y-[1px]";

    let colors = {
        from: "#cccccc",
        to: "#666666",
        text: "black",
    }
    if (mode == "plain") {
        colors = {
            from: "transparent",
            to: "transparent",
            text: "white",
        }
    } else if (mode == "primary") {
        colors = {
            from: "#FFA40B",
            to: "#EC4700",
            text: "white",
        }
    } else if (mode == "danger") {
        colors = {
            from: "transparent",
            to: "transparent",
            text: "#ef4444",
        }
    }


    return <div className={"relative " + className} style={{ height: h, minHeight: h }}>
        {/* 发光边缘层 */}
        < div className={"absolute inset-[1px] ring-[1px] ring-white/50 pointer-events-none active:translate-y-[1px] " + rounded} ></div >

        {
            disabled && <div
                className={"absolute w-full h-full bg-black/50 pointer-events-none active:translate-y-[1px] " + rounded} ></div>
        }

        <button className={" w-full h-full p-1 bg-[linear-gradient(to_bottom,var(--from),var(--to))] px-4 font-bold shadow-[0_2px_6px_rgba(0,0,0,0.8)]  " + rounded + textSize + invisable + activeStyle}
            type={type}
            style={{
                "--from": colors.from,
                "--to": colors.to,
                color: colors.text,
            } as React.CSSProperties}

            onClick={
                (evt) => {
                    if (disabled || loading) return;
                    if (onClick) onClick(evt);
                }
            }
        >
            {children}
        </button>

        {
            loading && <div className="absolute w-full h-full inset-0 flex items-center justify-center">
                <Spinner size="s" />
            </div>
        }

    </div >
}

export default DFButton;
export type { DFButtonProps }