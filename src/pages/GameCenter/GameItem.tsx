import { FC } from "react";

export interface GameItemProps {
  game: {
    img: string;
    name: string;
  };
}

const GameItem: FC<GameItemProps> = ({ game }) => {
  return (
    <div>
      <img src={game.img} alt="game image" className="rounded-lg" />
      <p className="text-sm truncate w-[60px]">{game.name}</p>
    </div>
  );
};

export default GameItem;
