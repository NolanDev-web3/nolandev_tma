import { FC, useState } from "react";

type DFImageProps = {
    src: string,
    size?: number,
    disableBackground?: boolean,
    disableRing?: boolean,
    placeholder?: React.ReactNode;
}

const DFImage: FC<DFImageProps> = ({ src, size = 40, disableBackground, placeholder, disableRing }: DFImageProps) => {
    const gradientStyle = {
        background: "linear-gradient(to bottom, var(--from), var(--to))",
        "--from": "#004275",
        "--to": "#00254E",
    };

    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    return <div className="flex items-center justify-center relative flex-shrink-0 rounded-xl overflow-hidden w-[--image-size] aspect-square shadow-[0_4px_6px_rgba(0,0,0,0.5)]"
        style={{
            "--image-size": size + "px",
            ...(disableBackground ? {} : gradientStyle),
        } as React.CSSProperties}>
        {/** 发光边缘 */}
        {!disableRing && <div className={"absolute inset-[1px] ring-[1px] ring-white/20 pointer-events-none rounded-xl"} ></div >}

        {(!isLoaded || hasError) && (
            <div  >
                {placeholder ?? (<div className="flex items-center justify-center w-full h-full text-md text-white opacity-60">
                </div>)}
            </div>
        )}

        {!hasError && <img src={src} className="w-full h-full object-cover p-[1px]"
            onLoad={() => setIsLoaded(true)}
            onError={() => { setHasError(true) }} />}
    </div>
}

export type { DFImageProps }
export default DFImage;