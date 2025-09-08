import { Divider } from "@telegram-apps/telegram-ui";
import { FC, ReactNode } from "react";
import { Fragment } from "react/jsx-runtime";

const Section: FC<{ header?: string | ReactNode, disableDivider?: boolean, children: React.ReactNode, gap?: number }> = (
	{ header, disableDivider, children, gap = 12 }) => {
	return <div className="flex flex-col w-full">
		{header && <div className="text-md pb-2 font-semibold" >{header}</div>}
		<div className=" rounded-2xl flex flex-col" style={{ gap: gap }}>
			{Array.isArray(children) ? children.map((child, index) => (
				<Fragment key={index}>
					{child}
					{(index < (children.length - 1)) && (!disableDivider) && <Divider />}
				</Fragment>
			)) : children
			}
		</div>
	</div>
}

export default Section;