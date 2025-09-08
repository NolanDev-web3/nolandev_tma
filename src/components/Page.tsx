import { backButton } from '@telegram-apps/sdk-react';
import { PropsWithChildren, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function Page({ children, back = "back", allowYScroll = false }: PropsWithChildren<{
	back?: "close" | "back" | "nop" | string
	/**
	 * True if it is allowed to scroll on this page
	 */
	allowYScroll?: boolean
}>) {
	const navigate = useNavigate();
	// const top = useSignal(viewport.safeAreaInsetTop);
	// const bottom = useSignal(viewport.safeAreaInsetBottom);
	// const contentTop = useSignal(viewport.contentSafeAreaInsetTop)
	// const contentBottom = useSignal(viewport.contentSafeAreaInsetBottom)

	// const pt = includeContentSafeArea ? top + contentTop : top;
	// const pb = includeContentSafeArea ? bottom + contentBottom : bottom;

	useEffect(() => {
		if (back == "nop") {
			return
		} else if (back != null && back != "" && back != "close") {
			backButton.show();
			return backButton.onClick(() => {
				if (back == "back") {
					navigate(-1);
				} else {
					navigate(back);
				}
			});
		} else {
			backButton.hide();
		}
	}, [back]);

	// return <div className={`w-full h-full min-h-full`} style={{ paddingTop: pt + "px", paddingBottom: pb + "px" }}>
	// 	<div id="page" className={`w-full h-full ${allowYScroll ? "overflow-y-auto" : ""}`}>{children}</div>
	// </div>

	return <div id="page" className={`w-full h-full ${allowYScroll ? "overflow-y-auto" : ""}`}>
		{children}
	</div>
}