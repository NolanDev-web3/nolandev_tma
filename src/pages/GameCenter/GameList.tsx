import { List, Spinner } from "@telegram-apps/telegram-ui";
import GameListItem from "./GameListItem";
import { useEffect, useRef, useState } from "react";
import { GameData } from "@/components/DashFunData/GameData";
import { GameApi } from "@/utils/DashFunApi";
import { useLaunchParams } from "@telegram-apps/sdk-react";

/*
const dummyGameData: GameData[] = [
  { id: 1, name: 'Game One', iconUrl: 'icon1.png', desc: 'An action-packed adventure.' },
  { id: 2, name: 'Game Two', iconUrl: 'icon2.png', desc: 'A thrilling puzzle game.' },
  { id: 3, name: 'Game Three', iconUrl: 'icon3.png', desc: 'An exciting adventure game.' },
  { id: 4, name: 'Game Four', iconUrl: 'icon4.png', desc: 'A fun and engaging game.' },
  { id: 5, name: 'Game Five', iconUrl: 'icon5.png', desc: 'A challenging strategy game.' },
  { id: 6, name: 'Game Six', iconUrl: 'icon6.png', desc: 'A fast-paced racing game.' },
  { id: 7, name: 'Game Seven', iconUrl: 'icon7.png', desc: 'A relaxing puzzle game.' },
  { id: 8, name: 'Game Eight', iconUrl: 'icon8.png', desc: 'An immersive RPG game.' },
  { id: 9, name: 'Game Nine', iconUrl: 'icon9.png', desc: 'A thrilling action game.' },
  { id: 10, name: 'Game Ten', iconUrl: 'icon10.png', desc: 'A fun and addictive game.' },
  { id: 11, name: 'Game Eleven', iconUrl: 'icon11.png', desc: 'A captivating adventure game.' },
  { id: 12, name: 'Game Twelve', iconUrl: 'icon12.png', desc: 'A strategic board game.' },
  { id: 13, name: 'Game Thirteen', iconUrl: 'icon13.png', desc: 'A challenging puzzle game.' },
  { id: 14, name: 'Game Fourteen', iconUrl: 'icon14.png', desc: 'An exciting sports game.' },
  { id: 15, name: 'Game Fifteen', iconUrl: 'icon15.png', desc: 'A fun and interactive game.' },
  { id: 16, name: 'Game Sixteen', iconUrl: 'icon16.png', desc: 'A fast-paced arcade game.' },
  { id: 17, name: 'Game Seventeen', iconUrl: 'icon17.png', desc: 'A relaxing simulation game.' },
  { id: 18, name: 'Game Eighteen', iconUrl: 'icon18.png', desc: 'An immersive strategy game.' },
  { id: 19, name: 'Game Nineteen', iconUrl: 'icon19.png', desc: 'A thrilling adventure game.' },
  { id: 20, name: 'Game Twenty', iconUrl: 'icon20.png', desc: 'A fun and engaging puzzle game.' },
];
*/

export default function GameList() {
  const [loading, setLoading] = useState(false);

  const [gameData, setGameData] = useState<GameData[]>([]);

  const [currentPage, setCurrentPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [hasReachedEnd, setHasReachedEnd] = useState(false);

  const initDataRaw = useLaunchParams().initDataRaw;

  const listRef = useRef(null)

  const fetchGameData = (page: number) => {
    setLoading(true);
    GameApi.gameSearch(initDataRaw as string, "", page).then((res) => {
      const { data, page, total_pages } = res;
      console.log("res: ", res);
      setCurrentPage(page);
      setTotalPages(total_pages);
      setGameData((pre) => [...pre, ...data]);
    }).catch((err) => {
      console.error("Error fetching game data", err);

    }).finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchGameData(currentPage);
  }, []);

  console.log("gameData", gameData);

  // Function to check if we've scrolled to the bottom
  const handleScroll = () => {
    if (!listRef.current) return;

    const bottom = (listRef.current as HTMLElement).scrollHeight === (listRef.current as HTMLElement).scrollTop + (listRef.current as HTMLElement).clientHeight;
    if (bottom && !loading) {
      // If scrolled to bottom and not already loading, fetch more data
      console.log("Scrolled to bottom");
      if (currentPage < totalPages) {
        setLoading(true);
        fetchGameData(currentPage + 1);
      } else {
        setHasReachedEnd(true);
      }
    }
  };

  return (
    <div
      ref={listRef}
      onScroll={handleScroll}
      style={{
        height: "calc(100vh - 350px)", // Adjust the height as needed
        overflowY: "auto",
      }}
    >
      <List
        style={{
          padding: 0,
        }}
      >
        {
          gameData.map((game) => (
            <GameListItem key={game.id} data={game} />
          ))
        }
        {/* {dummyGameData.map((game) => (
          <GameListItem key={game.id} data={game} />
        ))} */}
      </List>
      {
        loading && (
          <div className="flex justify-center">
            <Spinner size="s" />
          </div>
        )
      }
      {
        hasReachedEnd && (
          <div className="flex justify-center">
            <span className="text-gray-500 text-sm">No more games</span>
          </div>
        )
      }
    </div>
  );
}
