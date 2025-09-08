import GameItem from "@/pages/GameCenter/GameItem";
import { Button } from "@telegram-apps/telegram-ui";
import { FC } from "react";

const recentGamesData = [
  {
    img: "https://picsum.photos/60",
    name: "Game Name",
  },
  {
    img: "https://picsum.photos/60",
    name: "Game Name",
  },
  {
    img: "https://picsum.photos/60",
    name: "Game Name",
  },
  {
    img: "https://picsum.photos/60",
    name: "Game Name",
  },
  {
    img: "https://picsum.photos/60",
    name: "Game Name",
  },
  {
    img: "https://picsum.photos/60",
    name: "Game Name",
  },
];

const RecentGame: FC = () => {
  const onSeeAll = () => {};

  return (
    <div className="rounded-lg bg-section-bg-color p-3">
      <div className="flex justify-between items-center">
        <p className="text-md font-bold">Recent</p>
        <Button mode="plain" onClick={onSeeAll}>
          See All
        </Button>
      </div>
      {recentGamesData.length === 0 ? (
        <p className="text-center">Nothing here. Go to play some games!</p>
      ) : (
        <RecentGameList />
      )}
    </div>
  );
};

const RecentGameList: FC = () => {
  const visibleNums = 4;

  return (
    <div className="flex justify-between">
      {recentGamesData.slice(0, visibleNums).map((game, index) => (
        <GameItem key={index} game={game} />
      ))}
    </div>
  );
};

export default RecentGame;
