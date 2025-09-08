import React from "react";

type MixedValue =
    | string
    | { type: "text"; value: string; style?: React.CSSProperties; }
    | { type: "image"; src: string; alt?: string; style?: React.CSSProperties; }
    | { type: "button"; text: string; onClick: () => void; style?: React.CSSProperties; };

interface MixedTextProps {
    template: string;
    variables: Record<string, MixedValue>;
    style?: React.CSSProperties;
}

const MixedText: React.FC<MixedTextProps> = ({ template, variables, style }) => {
    const parts = template.split(/(%\w+)/); // 分割出变量部分
    if (style == null) {
        style = {};
    }
    if (style.fontSize == null) {
        style.fontSize = 16;
    }

    const renderPart = (part: string, index: number) => {
        const match = part.match(/^%(\w+)$/);
        if (match) {
            const key = match[1];
            const value = variables[key];

            if (typeof value === "string") {
                return <span key={index}>{value}</span>;
            }

            if (value && typeof value === "object") {
                switch (value.type) {
                    case "text":
                        return (
                            <span key={index} style={value.style}>
                                {value.value}
                            </span>
                        );
                    case "image":
                        return (
                            <img
                                key={index}
                                src={value.src}
                                alt={value.alt || ""}
                                style={{
                                    verticalAlign: "middle",
                                    display: "inline-block",
                                    ...(value.style || {})
                                }}
                            />
                        );
                    case "button":
                        return (
                            <button
                                key={index}
                                onClick={value.onClick}
                                style={{
                                    display: "inline-block",
                                    verticalAlign: "middle",
                                    fontSize: "12px",
                                    padding: "2px 8px",
                                    margin: "0 4px",
                                    cursor: "pointer",
                                    ...(value.style || {})
                                }}
                            >
                                {value.text}
                            </button>
                        );
                }
            }

            return null;
        }

        // 普通文本
        return <span key={index}>{part}</span>;
    };

    return <div style={{ ...style }}>{parts.map(renderPart)}</div>;
};

export default MixedText;