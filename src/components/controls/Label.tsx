import { FC } from "react";

const DFLabel: FC<{ rounded?: "full" | "sm" | "md" | "lg", children: React.ReactNode }> = ({ children, rounded = "full" }) => {

    const r = "rounded-" + rounded;
    return <div className={"flex items-center bg-gradient-to-b from-[#F0404070] to-[#F0404050] \
    shadow-[0_4px_12px_rgba(0,0,0,0.5)] backdrop-blur-sm relative " + r}>
        <div className={"absolute inset-[1px] ring-[1px] ring-[#F04040]/30 pointer-events-none " + r}></div>
        <div className=" text-white w-full">{children}</div>
    </div>
}

export const DFInfoLabel: FC<{ rounded?: "full" | "sm" | "md" | "lg", children: React.ReactNode }> = ({ children, rounded = "full" }) => {
    const r = "rounded-" + rounded;
    return <div className={"flex items-center bg-gradient-to-b from-[#f0e14070] to-[#f0e14050] \
    shadow-[0_4px_12px_rgba(0,0,0,0.5)] backdrop-blur-sm relative " + r}>
        <div className={"absolute inset-[1px] ring-[1px] ring-[#f0e140]/30 pointer-events-none " + r}></div>
        <div className=" text-white w-full">{children}</div>
    </div>
}

export default DFLabel;


