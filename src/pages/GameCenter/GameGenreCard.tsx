import { Button, Title } from "@telegram-apps/telegram-ui";
import GameList from "./GameList";
import { useNavigate } from "react-router-dom";

export default function GameGenreCard({ genre }: { genre: string }) {
  const navigate = useNavigate();

  const onSeeAll = () => {
    // utils.openLink("/");
    const queryString = new URLSearchParams({ genre: genre }).toString();
    const url = `/game-genre?${queryString}`;
    navigate(url);
  };

  return (
    <div
      className="w-full p-4 rounded-xl"
      style={{
        backgroundColor: "var(--tg-theme-section-bg-color)",
      }}
    >
      <div className="flex justify-between">
        <Title level="3" weight="2" className="mb-2">
          {genre}
        </Title>
        <Button mode="plain" onClick={onSeeAll}>
          See All
        </Button>
      </div>

      <GameList />
    </div>
  );
}
