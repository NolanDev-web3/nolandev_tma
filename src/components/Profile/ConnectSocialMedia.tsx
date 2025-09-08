import { FC } from "react";

const ConnectSocialMedia: FC = () => {
  return (
    <div>
      <p className="font-bold mb-1">Connect your social media</p>
      <div className="flex justify-between gap-3">
        <SocialMediaButton />
        <SocialMediaButton />
      </div>
    </div>
  );
};

const SocialMediaButton: FC = () => {
  return (
    <div className="bg-section-bg-color w-[50%] p-2 flex items-center justify-center rounded-lg">
    </div>
  );
};

export default ConnectSocialMedia;
