import { GameData } from "@/components/DashFunData/GameData";
import { Button, Cell } from "@telegram-apps/telegram-ui";
import { useNavigate } from "react-router-dom";
export type GameListItemInfo = {
  img: string,
  name: string
}

export default function GameListItem({ data }: { data: GameData }) {

  const navigate = useNavigate();

  return (
    <Cell
      before={
        <img
          src={data.getIconUrl()}
          alt="game image"
          className="rounded-lg w-[50px] object-contain aspect-contain"
        />
      }
      after={
        <Button size="s" mode="bezeled" className="px-4" onClick={(e) => e.stopPropagation()}>
          PLAY
        </Button>
      }
      subtitle={data.desc}
      //   style={{ padding: 0, gap: 10 }}
      className="no-padding-cell"
      onClick={() => navigate(`/game-details/${data.id}`)}
    >
      {data.name}
    </Cell>
  );
}
