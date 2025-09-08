import { FC } from "react";
import GameItem from "./GameItem";
import { Divider, List, Spinner } from "@telegram-apps/telegram-ui";
import { Player } from "@lottiefiles/react-lottie-player";
import { GameData } from "@/components/DashFunData/GameData";
import GameListItem from "./GameListItem";

const recommendedGameData = [
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

// interface SearchPageProps {
//   // searchResults: GameItemProps['game'][];
//   searchResults: Array<GameItemProps["game"]>;
// }

const SearchPage = ({ searchResults, searchLoading }: { searchResults: GameData[], searchLoading: boolean }) => {
  return (
    <div>
      <p className="text-sm uppercase font-bold">Recommended</p>
      <RecommendedGameList />
      <Divider className="my-5" />
      {searchResults.length ?
        <div>
          <List
            style={{
              padding: 0,
            }}
          >
            {searchResults.map((game, index) => (
              <GameListItem key={index} data={game} />
            ))}
          </List>
        </div>
        : searchLoading ? <div className="flex justify-center">
          <Spinner size="m" />
        </div> :
          <NotFoundInfo />}
    </div>
  );
};

const RecommendedGameList: FC = () => {
  return (
    <div className="flex overflow-x-auto hide-scrollbar gap-5 py-3">
      {recommendedGameData.map((game, index) => (
        <GameItem key={index} game={game} />
      ))}
    </div>
  );
};

const NotFoundInfo: FC = () => {
  return (
    <div className="flex flex-col items-center">
      <Player
        autoplay
        loop
        src="https://lottie.host/804fdb4f-8256-4bd0-854e-d98c5873c69e/Vs2VBaogKr.json"
        style={{ width: "150px" }}
      />
      <p className="font-bold text-lg ">No Results</p>
    </div>
  );
};

export default SearchPage;
