import { useSignal, viewport } from "@telegram-apps/sdk-react";
import { getCSSVarNumber } from "../Utils/Css";

const CssVarDashFunSafeAreaTop = "--dashfun-safe-area-inset-top";
const CssVarDashFunSafeAreaBottom = "--dashfun-safe-area-inset-bottom";
const CssVarDashFunContentSafeAreaTop = "--dashfun-content-safe-area-inset-top";
const CssVarDashFunContentSafeAreaBottom = "--dashfun-content-safe-area-inset-bottom";

type SafeArea = {
	top: number;
	bottom: number;
	left?: number;
	right?: number;
};

const useDashFunSafeArea = (): { safeArea: SafeArea, content: SafeArea } => {
	const state = useSignal(viewport.state);
	const { contentSafeAreaInsets, safeAreaInsets } = state;

	const df_top = getCSSVarNumber(CssVarDashFunSafeAreaTop);
	const df_bottom = getCSSVarNumber(CssVarDashFunSafeAreaBottom);

	const df_content_top = getCSSVarNumber(CssVarDashFunContentSafeAreaTop);
	const df_content_bottom = getCSSVarNumber(CssVarDashFunContentSafeAreaBottom);

	const safeArea: SafeArea = {
		top: safeAreaInsets.top + df_top,
		bottom: safeAreaInsets.bottom + df_bottom,
		left: safeAreaInsets.left,
		right: safeAreaInsets.right
	};

	const content: SafeArea = {
		top: contentSafeAreaInsets.top + df_content_top,
		bottom: contentSafeAreaInsets.bottom + df_content_bottom,
		left: contentSafeAreaInsets.left,
		right: contentSafeAreaInsets.right
	};


	return {
		safeArea,
		content
	};
}


export default useDashFunSafeArea;