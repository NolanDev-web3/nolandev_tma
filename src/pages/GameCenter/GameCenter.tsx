import { FC, useEffect, useState } from "react";
// import GameGenreCard from "./GameGenreCard";
import { Avatar, Input, Tappable, Title } from "@telegram-apps/telegram-ui";
import { useNavigate } from "react-router-dom";
import SearchPage from "./SearchPage";
// import PromotionCard from "./PromotionCard";
import GameChipList from "./GameChipList";
import GameList from "./GameList";
import { GameApi } from "@/utils/DashFunApi";
import { useLaunchParams } from "@telegram-apps/sdk-react";
import { GameData } from "@/components/DashFunData/GameData";

const GameCenter: FC = () => {
  const navigate = useNavigate();

  const [showSearchPage, setShowSearchPage] = useState(false);

  const [searchValue, setSearchValue] = useState("");

  const [searchResults, setSearchResults] = useState<GameData[]>([]);

  const [searchLoading, setSearchLoading] = useState(false);

  // const [gameData, setGameData] = useState<GameData[]>([]);

  // const [loading, setLoading] = useState(false);

  const initDataRaw = useLaunchParams().initDataRaw;

  // useEffect(() => {
  //   GameApi.gameSearch(initDataRaw as string).then((res) => {
  //     const { data, page, size, total_pages } = res;
  //     console.log("res: ", res)
  //     setGameData(data);
  //   })
  // }, []);

  // console.log("gameData", gameData);

  const openProfile = () => {
    navigate("/profile");
  };

  const onSearchGames = (value: string) => {
    setSearchValue(value);
  };

  const onSearchStart = () => {
    console.log("searching started");
    if (showSearchPage) return;
    setShowSearchPage(true);
  };

  const onCancelSearch = () => {
    if (!showSearchPage) return;
    setSearchValue("");
    setSearchResults([]);
    setShowSearchPage(false);
  };


  useEffect(() => {
    const delay = 1000; // debounce delay in milliseconds
    let timeoutId: NodeJS.Timeout | null = null;

    const debounceSearch = () => {
      if (searchValue !== "") {
        setSearchLoading(true);
        GameApi.gameSearch(initDataRaw as string, searchValue)
          .then((res) => {
            if (res) {
              const { data } = res;
              console.log("res: ", res);
              setSearchResults(data);
            } else {
              setSearchResults([]);
            }
          })
          .catch((err) => {
            console.error("Error fetching game data", err);
          }).finally(() => {
            setSearchLoading(false);
          });
      }
    };

    const handleSearch = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(debounceSearch, delay);
    };

    handleSearch();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [searchValue]);


  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex justify-between items-center">
        <Title weight="2">Game Center</Title>
        <Avatar
          size={40}
          src="https://avatars.githubusercontent.com/u/84640980?v=4"
          onClick={openProfile}
        />
      </div>

      <div className="sticky top-[2vh] z-[10]">
        <Input
          status="focused"
          placeholder="Search for games"
          value={searchValue}
          onChange={(e) => onSearchGames(e.target.value)}
          onClick={onSearchStart}
          after={
            <Tappable
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onCancelSearch();
              }}
              style={{ display: "flex", cursor: "pointer" }}
            >
              &#10006;
            </Tappable>
          }
        />
        <div className="mt-2">
          <GameChipList />
        </div>
      </div>

      {showSearchPage ? (
        <SearchPage searchResults={searchResults} searchLoading={searchLoading} />
      ) : (
        <>

          <GameList />
          {/* <PromotionCard />
          <GameGenreCard genre={"FPS"} />
          <GameGenreCard genre={"RPG"} /> */}
        </>
      )}
    </div>
  );
};
export default GameCenter;
