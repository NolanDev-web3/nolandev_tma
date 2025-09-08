import { TGLink } from "@/utils/DashFunApi";

type GameDataParams = {
	id: string;
	name: string;
	desc: string;
	url: string;
	genre: number[];
	iconUrl: string;
	time: number;
	openTime: number;
	logoUrl: string;
	mainPicUrl: string;
	status: number;
	suggest: number;
}

class GameData {
	id: string = "";
	name: string = "";
	desc: string = "";
	url: string = "";
	logoUrl: string = "";
	mainPicUrl: string = "";
	genre: number[] = [];
	iconUrl: string = "";
	time: number = 0;
	openTime: number = 0;
	status: number = 0;
	suggest: number = 0;

	tgLink(): string {
		// return "https://t.me/DashFunBot/Games?startapp=" + this.id;
		return TGLink.gameLink(this.id)
	}

	getImageUrl(url: string): string {
		if (url.startsWith("http")) {
			return url;
		} else {
			return `https://res.dashfun.games/images/${this.id}/${url}`;
		}
	}

	getIconUrl(): string {
		if (this.iconUrl == "") {
			return "https://res.dashfun.games/icons/dashfun-icon-256.png"
		}
		return this.getImageUrl(this.iconUrl);
	}

	getLogoUrl(): string {
		if (this.logoUrl == "") {
			return "https://res.dashfun.games/icons/dashfun-logo-transparent.png"
		}
		return this.getImageUrl(this.logoUrl);
	}
	getMainPicUrl(): string {
		if (this.mainPicUrl == "") {
			return "https://res.dashfun.games/icons/dashfun-logo-transparent.png"
		}
		return this.getImageUrl(this.mainPicUrl);
	}

	constructor(data: GameDataParams) {
		const { id, name, desc, url, genre, iconUrl, time, openTime, mainPicUrl, logoUrl, status, suggest } = data;
		this.id = id;
		this.name = name;
		this.desc = desc;
		this.url = url;
		this.genre = genre;
		this.iconUrl = iconUrl;
		this.time = time;
		this.mainPicUrl = mainPicUrl;
		this.logoUrl = logoUrl;
		this.openTime = openTime;
		this.status = status;
		this.suggest = suggest;
	}
}

class GameDataList {
	data: GameData[] = [];
	page: number = 0;
	size: number = 0;
	total_pages: number = 0;

	constructor(data: GameData[], page: number, size: number, total_pages: number) {
		this.data = data;
		this.page = page;
		this.size = size;
		this.total_pages = total_pages;
	}
}

enum GameListType {
	Played = 0,
	New = 1,
	Popular = 2,
	Suggest = 3,
	Banner = 4,
	Favorites = 5,
}

/**
 * 从服务器请求的gamelist结果
 */
class GameListResult {
	//GameListType -> GameId[]
	game_list: { [key: number]: string[] } = {};
	games: GameData[] = []
	getGame: (id: string) => GameData | undefined = (id: string) => {
		return this.games.find(g => g.id == id);
	}
}

export { GameData, GameDataList, GameListType, GameListResult }
export type { GameDataParams }