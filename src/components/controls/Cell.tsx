import { FC, MouseEventHandler, ReactNode } from "react";

export type DFCellProps = {
    children: ReactNode;
    className?: string | undefined;
    subtitle?: ReactNode;
    before?: ReactNode;
    after?: ReactNode;
    mode?: "normal" | "highlight" | "primary" | "wood"
    disableBeforeRing?: boolean | undefined; // 是否禁用before部分的ring
    onClick?: MouseEventHandler | undefined;
}


const DFCell: FC<DFCellProps> = (props: DFCellProps) => {
    const { children, mode = "highlight", className, subtitle, disableBeforeRing, before, after, onClick } = props;

    var colorScheme = {
        bgFrom: "#071B28",
        bgTo: "#002638",
        ring: "#003658",
        beforeRing: "#FD7300",
        text: "#FDCE3C",
        subText: "#FDE59D",
    }

    if (mode == "highlight") {
        colorScheme = {
            bgFrom: "#942C00",
            bgTo: "#AD4100",
            ring: "#FD7300",
            text: "#FDCE3C",
            beforeRing: "#FD7300",
            subText: "#FDE59D",
        }
    } else if (mode == "primary") {
        colorScheme = {
            bgFrom: "#1E6493",
            bgTo: "#0C3D63",
            ring: "#60A5FACC",
            beforeRing: "#60A5FACC",
            text: "#FFFFFF",
            subText: "#cccccc",
        }

    }

    let bg = " bg-[linear-gradient(to_bottom,var(--from),var(--to))] ";
    let bgStyle = null;
    if (mode == "wood") {
        bg = "   ";
        bgStyle = {
            backgroundSize: "cover",
        }
    }
    return <div className={"w-full py-3 px-3 gap-2 flex justify-center items-center text-[var(--text-color)] relative \
                shadow-[0_4px_6px_rgba(0,0,0,0.5)] rounded-xl " + bg + className} onClick={onClick}
        style={{
            "--from": colorScheme.bgFrom,
            "--to": colorScheme.bgTo,
            "--text-color": colorScheme.text,
            ...bgStyle,
        } as React.CSSProperties}>
        <div className={"absolute inset-[1px] ring-[2px] ring-[var(--ring-color)] pointer-events-none rounded-xl"}
            style={{
                "--ring-color": colorScheme.ring,
            } as React.CSSProperties}></div>

        {before && <div className="flex-shrink-0 relative">
            {before}
            {disableBeforeRing != true && <div className={"absolute inset-[1px] ring-[2px] ring-[var(--ring-color)] pointer-events-none rounded-xl"}
                style={{
                    "--ring-color": colorScheme.beforeRing,
                } as React.CSSProperties}></div>}
        </div>}
        <div className="flex flex-col flex-1 gap-1 truncate min-w-0">
            {children}
            <div className="text-sm text-[var(--sub-text-color)]"
                style={{
                    "--sub-text-color": colorScheme.subText,
                } as React.CSSProperties}>
                {subtitle}
            </div>
        </div>

        {after && <div className="flex-shrink-0 relative text-inherit">
            {after}
        </div>}
    </div>
}

export default DFCell;