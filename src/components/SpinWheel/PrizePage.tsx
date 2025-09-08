import { getCoinIcon } from "@/constats";
import { FC, useState } from "react";
import { DashFunCoins } from "../DashFun/DashFunCoins";
import { useDashFunSpinWheel } from "../DashFun/DashFunSpinWheel";
import { SpinWheelConstants } from "../DashFunData/SpinWheelData";
import { SpinWheelStatusChangedEvent } from "../Event/Events";
import { Avatar } from "@telegram-apps/telegram-ui";

const PrizePage: FC<{ coins: DashFunCoins, setCanClaim: (value: boolean) => void }> = ({ coins, setCanClaim }) => {
  const [loading, setLoading] = useState(false);

  const [spinWheel, _, claim] = useDashFunSpinWheel();

  const reward = spinWheel?.rewards[spinWheel?.rewardIndex];

  const spinWheelStatus = spinWheel?.status;

  //目前奖励只有一种类型，奖励对应的游戏币
  const coin = coins.findCoinByGameId(spinWheel?.gameId || "");

  const onClaim = async () => {
    setLoading(true);
    try {
      const claimRes = await claim();
      SpinWheelStatusChangedEvent.fire(spinWheel.id, SpinWheelConstants.Status.Claimed);
      console.log("claim res", claimRes);
      setTimeout(() => {
        setCanClaim(false);
      }, 5000);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  let dom = <></>

  switch (spinWheelStatus) {
    case SpinWheelConstants.Status.CanClaim:
      dom = <div className="self-start w-full">
        <p className="text-xl text-center pb-4">{reward?.value} {coin?.coin.name}</p>
        <button
          className={`${loading ? "bg-gray-500" : "bg-blue-500"
            } w-full text-xl font-bold text-white py-2 rounded-md block`}
          onClick={onClaim}
          disabled={loading}
        >
          {loading ? "Grabing..." : "Grab the prize"}
        </button>
      </div>
      break;
    case SpinWheelConstants.Status.Claimed:
      dom = <p className="text-xl self-center pb-4">
        You got {reward?.value} {coin?.coin.name}!
      </p>
      break;
  }

  return (
    <div className="flex flex-col flex-wrap justify-center items-center w-full">
      <div className="py-4">
        <Avatar size={96} src={coin == null ? "" : getCoinIcon(coin.coin.name)} />
      </div>
      {dom}
    </div>
  );
}


export default PrizePage