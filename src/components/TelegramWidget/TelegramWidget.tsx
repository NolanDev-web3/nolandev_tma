import { useEffect } from "react";

type TelegramUser = {
	id: number;
	first_name: string;
	last_name?: string;
	username?: string;
	photo_url?: string;
	auth_date: number;
	hash: string;
};

interface TelegramLoginProps {
	botName: string;
	onAuth: (user: TelegramUser) => void;
}

declare global {
	interface Window {
		handleTelegramAuth?: (user: TelegramUser) => void;
	}
}

export default function TelegramLogin({ botName, onAuth }: TelegramLoginProps) {
	useEffect(() => {
		const script = document.createElement("script");
		script.src = "https://telegram.org/js/telegram-widget.js?22";
		script.setAttribute("data-telegram-login", botName);
		script.setAttribute("data-size", "large");
		script.setAttribute("data-userpic", "true");
		script.setAttribute("data-request-access", "write");
		script.setAttribute("data-onauth", "handleTelegramAuth(user)");
		script.async = true;

		// 将处理函数挂载到全局
		window.handleTelegramAuth = (user: TelegramUser) => {
			onAuth(user);
		};

		const container = document.getElementById("telegram-button-container");
		if (container) {
			container.appendChild(script);
		}

		return () => {
			delete window.handleTelegramAuth;
		};
	}, [botName, onAuth]);

	return <div id="telegram-button-container" />;
}

export type { TelegramUser }