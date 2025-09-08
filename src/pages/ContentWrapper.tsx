import useDashFunSafeArea from "@/components/DashFun/DashFunSafeArea";
import { PropsWithChildren } from "react";

export const ContentWrapper = ({ children, includeContentSafeArea = true, paddingTopAdd, paddingBottomAdd, className }: PropsWithChildren<{ includeContentSafeArea?: boolean, paddingTopAdd?: number, paddingBottomAdd?: number, className?: string }>) => {
	const { safeArea, content } = useDashFunSafeArea();

	const pt = (includeContentSafeArea ? safeArea.top + content.top : safeArea.top) + (paddingTopAdd ?? 0);
	const pb = (includeContentSafeArea ? safeArea.bottom + content.bottom : safeArea.bottom) + (paddingBottomAdd ?? 0);
	return <div id="content-wrapper" className={"w-full flex flex-col " + className} style={{ paddingTop: pt, paddingBottom: pb }}>
		{children}
	</div>
}