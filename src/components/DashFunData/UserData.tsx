class DashFunUser {
	id: string				//全局userId
	channelId: string		//渠道方id
	displayName: string 	//显示名称
	userName: string 		//用户名
	avatarUrl: string		//avatar地址
	from: number			//用户来源
	createData: number		//创建时间
	loginTime: number		//登录时间
	logoffTime: number		//登出时间
	language: string 		//语言设定
	level: number			//DashFun 等级
	nickname: string		//昵称

	constructor(data: any) {
		const { id, channel_id, display_name, user_name, avatar_url, from, create_data, login_time, logoff_time, language, level, nickname } = data
		this.id = id;
		this.channelId = channel_id;
		this.displayName = display_name;
		this.userName = user_name;
		this.avatarUrl = avatar_url;
		this.from = from;
		this.createData = create_data;
		this.loginTime = login_time;
		this.logoffTime = logoff_time;
		this.language = language;
		this.level = level || 1;
		this.nickname = nickname || "";
	}
}

export { DashFunUser }