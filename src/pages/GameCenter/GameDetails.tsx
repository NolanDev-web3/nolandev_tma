import { GameData } from "@/components/DashFunData/GameData";
import { GameGenre } from "@/constats";
import { GameApi } from "@/utils/DashFunApi";
import { useLaunchParams } from "@telegram-apps/sdk-react";
import { Button, Spinner } from "@telegram-apps/telegram-ui";
import { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// const gameData = {
//   desc: "Game Create Test Desc",
//   genre: [1],
//   iconUrl: "cl9mqe85yww.png",
//   id: "chbh9vv5qf4",
//   logoUrl: "cvwzrg8ar5s.png",
//   mainPicUrl: "cvy7f4nc5xc.png",
//   name: "Game sCreate Test",
//   openTime: 0,
//   status: 2,
//   time: 1728408733877,
//   url: "https://www.google.com",
// };

const GameDetails: FC = () => {
  const { id } = useParams();

  const [gameData, setGameData] = useState<GameData | null>(null);

  const [loading, setLoading] = useState(false);

  const initDataRaw = useLaunchParams().initDataRaw;

  useEffect(() => {
    console.log("id", id);
    if (!id) return;
    setLoading(true);
    GameApi.findGame(id, initDataRaw as string)
      .then((res) => {
        setGameData(res);
      })
      .catch((err) => {
        console.error("Error fetching game data", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const getGenres = () => {
    const genre = gameData?.genre;
    const genres: string[] = [];
    if (genre && genre.includes(GameGenre.Card)) {
      genres.push("Card");
    }
    if (genre && genre.includes(GameGenre.New)) {
      genres.push("Action");
    }
    if (genre && genre.includes(GameGenre.Popular)) {
      genres.push("Popular");
    }
    if (genre && genre.includes(GameGenre.RPG)) {
      genres.push("RPG");
    }
    if (genre && genre.includes(GameGenre.Strategy)) {
      genres.push("Strategy");
    }
    return ["Action", "RPG"];
  };

  return (
    <div className="min-h-screen">
      {loading ? (
        <div className="h-screen flex justify-center items-center">
          <Spinner size="m" />
        </div>
      ) : (
        <div className="">
          <div className="flex items-center gap-2 p-3">
            <img
              className="w-[50px] aspect-square object-cover rounded-full"
              src={gameData?.getLogoUrl()}
              alt="icon"
            />
            <div className="text-2xl">{gameData?.name}</div>
          </div>

          <img
            className="w-full aspect-video object-cover"
            src={gameData?.getMainPicUrl()}
            alt="main image"
          />
          <div className="p-3 flex flex-col gap-2">
            <div className="text-gray-300 text-sm">{gameData?.desc}</div>
            <div className="flex gap-2">
              {getGenres().map((genre, index) => (
                <span
                  key={index}
                  className="bg-gray-500 text-center text-sm font-bold px-2 py-1 rounded-xl"
                >
                  {genre}
                </span>
              ))}
            </div>
            <Button
              onClick={() => {
                window.open(gameData?.url, "_blank");
              }}
            >
              Play
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameDetails;
