import React, { FC } from "react";
import { Chip } from "@telegram-apps/telegram-ui";

const GameChipList: FC = () => {
  return (
    <div className="flex items-center overflow-x-auto hide-scrollbar gap-3 pb-2 w-[100vw]">
      <GameChip
        title="Favorites"
        icon={<i className="fa-solid fa-heart text-[#FF0000]" />}
      />
      <GameChip title="104" icon={<i className="fa-solid fa-coins" />} />
      <GameChip title="Popular" icon={<i className="fa-solid fa-fire" />} />
      <GameChip
        title="Game with friends"
        icon={<i className="fa-solid fa-user-group" />}
      />
    </div>
  );
};

const GameChip: FC<{ title: string; icon: React.ReactNode }> = ({
  title,
  icon,
}) => {
  return (
    <Chip mode="elevated" before={icon} className="whitespace-nowrap">
      {title}
    </Chip>
  );
};

export default GameChipList;
