import {
	$debug,
	backButton,
	closingBehavior,
	initData,
	init as initSDK,
	mainButton,
	miniApp,
	swipeBehavior,
	themeParams,
	viewport,
} from '@telegram-apps/sdk-react';

/**
 * Initializes the application and configures its dependencies.
 */
export function init(debug: boolean, platform: string): void {
	// Set @telegram-apps/sdk-react debug mode.
	$debug.set(debug);

	// Initialize special event handlers for Telegram Desktop, Android, iOS, etc. Also, configure
	// the package.
	initSDK();


	// Add Eruda if needed.
	debug && import('eruda')
		.then((lib) => lib.default.init())
		.catch(console.error);


	// Mount all components used in the project.
	backButton.isSupported() && backButton.mount();
	miniApp.mount();
	mainButton.mount();
	themeParams.mount();
	// miniApp.setHeaderColor("#eab308")
	swipeBehavior.isSupported() && swipeBehavior.mount();
	closingBehavior.mount();

	closingBehavior.enableConfirmation.ifAvailable();

	initData.restore();

	void viewport
		.mount()
		.catch(e => {
			console.error('Something went wrong mounting the viewport', e);
		})
		.then(() => {
			viewport.bindCssVars();
			if (platform != "tdesktop") {
				viewport.requestFullscreen.ifAvailable();
			}
		});

	// try {
	// 	await viewport.mount();
	// } catch (e: any) {
	// 	console.error('Something went wrong mounting the viewport', e);
	// }

	console.log("binding css vars")
	miniApp.bindCssVars();
	themeParams.bindCssVars();
	// void viewport.mount().then(() => {
	// 	// Define components-related CSS variables.
	// 	viewport.bindCssVars();
	// 	swipeBehavior.disableVertical();
	// 	// console.log("fullscreen:", requestFullscreen.isAvailable())
	// 	// if (requestFullscreen.isAvailable()) {
	// 	// 	requestFullscreen.ifAvailable()
	// 	// } else 
	// 	// if (disableVerticalSwipes.isAvailable()) {
	// 	// 	disableVerticalSwipes()
	// 	// }
	// 	// if (expandViewport.isAvailable()) {
	// 	// 	expandViewport();
	// 	// }
	// }).catch((e: any) => {
	// 	console.error('Something went wrong mounting the viewport', e);
	// });



}