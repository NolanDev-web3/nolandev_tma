import ReactDOM from 'react-dom/client';

import { Root } from '@/components/Root';
import { postEvent } from '@telegram-apps/sdk-react';
// Uncomment this import in case, you would like to develop the application even outside
// the Telegram application, just in your browser.
import './mockEnv.ts';

import '@telegram-apps/telegram-ui/dist/styles.css';
import './index.css';
import "tailwindcss/tailwind.css";

// let ts: number | undefined
// const onTouchStart = (e: TouchEvent) => {
// 	ts = e.touches[0].clientY
// }
// const onTouchMove = (e: TouchEvent) => {
// 	const scrollableEl = document.getElementById('app-scrollable')
// 	if (scrollableEl) {
// 		const scroll = scrollableEl.scrollTop
// 		const te = e.changedTouches[0].clientY
// 		if (scroll <= 0 && ts! < te) {
// 			e.preventDefault()
// 		}
// 	} else {
// 		e.preventDefault()
// 	}
// }

// document.documentElement.addEventListener('touchstart', onTouchStart, { passive: false })
// document.documentElement.addEventListener('touchmove', onTouchMove, { passive: false })

postEvent("web_app_expand")
//postEvent("web_app_setup_swipe_behavior", { allow_vertical_swipe: false })
ReactDOM.createRoot(document.getElementById('root')!).render(<Root />);

// const overflow = 100
// document.body.style.overflowY = 'hidden'
// // document.body.style.marginTop = `${overflow}px`
// document.body.style.height = window.innerHeight + overflow + "px"
// document.body.style.paddingBottom = `${overflow}px`
// // window.scrollTo(0, overflow)


