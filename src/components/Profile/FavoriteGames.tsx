import GameItem from "@/pages/GameCenter/GameItem";
import { Button } from "@telegram-apps/telegram-ui";
import { FC } from "react";

const favoritesGamesData = [
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

const FavoriteGames: FC = () => {
  const onSeeAll = () => {};

  return (
    <div className="rounded-lg bg-section-bg-color p-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <p className="text-md font-bold">Favorites</p>
        </div>

        <Button mode="plain" onClick={onSeeAll}>
          See All
        </Button>
      </div>
      {favoritesGamesData.length === 0 ? (
        <p className="text-center">
          Nothing here. Add your favorite games now!
        </p>
      ) : (
        <FavoriteGameList />
      )}
    </div>
  );
};

const FavoriteGameList: FC = () => {
  const visibleNums = 4;

  return (
    <div className="flex justify-between">
      {favoritesGamesData.slice(0, visibleNums).map((game, index) => (
        <GameItem key={index} game={game} />
      ))}
    </div>
  );
};

export default FavoriteGames;
