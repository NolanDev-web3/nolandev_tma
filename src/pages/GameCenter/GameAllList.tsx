import { FC } from "react";
import { initBackButton } from "@telegram-apps/sdk";
import { useSearchParams } from "react-router-dom";
import { Title } from "@telegram-apps/telegram-ui";
import GameList from "./GameList";

const GameAllList: FC = () => {
  const [backButton] = initBackButton();
  backButton.show();
  console.log(backButton.isVisible);

  const [searchParams] = useSearchParams();
  const genre = searchParams.get("genre");
  console.log(genre);

  return (
    <div className="w-full p-3">
      <Title weight="2" className="mb-2">
        {genre}
      </Title>
      <GameList />
    </div>
  );
};

export default GameAllList;
