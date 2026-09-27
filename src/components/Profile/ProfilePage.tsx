import { Avatar, Text } from "@telegram-apps/telegram-ui";
import { FC } from "react";
import ConnectSocialMedia from "./ConnectSocialMedia";

const ProfilePage: FC = () => {
  return (
    <div className="p-3 flex flex-col gap-3">
      <div className="flex items-center gap-5">
        <Avatar
          size={48}
          src="https://avatars.githubusercontent.com/u/84640980?v=4"
        />
        <Text weight="2">User Name</Text>
      </div>
      <ConnectSocialMedia />
    </div>
  );
};

export default ProfilePage;
