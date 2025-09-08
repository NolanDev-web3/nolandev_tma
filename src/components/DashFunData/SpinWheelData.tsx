const SpinWheelConstants = {
	Status: {
		Spin: 1, 		// 可转转盘
		CanClaim: 2, 	//可领取奖励
		Claimed: 3		//已领取奖励
	},
	RewardType: {
		GamePoint: 1, //奖励游戏对应的积分货币
	}

}

class SpinWheelData {
	id: string;
	gameId: string;
	status: number;
	rewards: SpinWheelReward[];
	/**
	 * 用户抽中的奖励索引
	 */
	rewardIndex: number;

	constructor(id: string, gameId: string, status: number) {
		this.id = id;
		this.gameId = gameId;
		this.status = status;
		this.rewards = []
		this.rewardIndex = 0;
	}

	copy() {
		const d = new SpinWheelData(this.id, this.gameId, this.status)
		d.rewards = this.rewards;
		d.rewardIndex = this.rewardIndex;
		return d;
	}

	addReward(index: number, type: number, value: number) {
		const r = new SpinWheelReward(index, type, value);
		this.rewards.push(r);
	}

	getReward(index: number): SpinWheelReward | null {
		for (const key in this.rewards) {
			const r = this.rewards[key];
			if (r.index == index) {
				return r;
			}
		}
		return null;
	}

	/**
	 * 返回用户是否可以转轮盘
	 */
	canSpin(): boolean {
		return this.status == SpinWheelConstants.Status.Spin;
	}

	/**
	 * 返回用户是否可以领取奖励
	 */
	canClaim(): boolean {
		return this.status == SpinWheelConstants.Status.CanClaim;
	}
}

class SpinWheelReward {
	index: number; //奖励的索引值
	type: number;//奖励类型
	value: number;//奖励值

	constructor(index: number, type: number, value: number) {
		this.index = index;
		this.type = type;
		this.value = value;
	}

}

export { SpinWheelData, SpinWheelReward, SpinWheelConstants }