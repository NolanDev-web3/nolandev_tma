import { Button, Modal, Placeholder } from "@telegram-apps/telegram-ui";
import { ModalClose } from "@telegram-apps/telegram-ui/dist/components/Overlays/Modal/components/ModalClose/ModalClose";
import { ModalHeader } from "@telegram-apps/telegram-ui/dist/components/Overlays/Modal/components/ModalHeader/ModalHeader";
import { FC, useState } from "react";

type ShareModalProps = {
  isOpen: boolean;
};

const ShareModal: FC<ShareModalProps> = () => {
  return (
    <Modal
      //   open={isOpen}
      trigger={
        <Button size="m" className="w-full">
          Invite Friends
        </Button>
      }
      header={
        <ModalHeader
          after={
            <ModalClose>
              <div>close</div>
            </ModalClose>
          }
        >
          Share
        </ModalHeader>
      }
    >
      <Placeholder description="Description" header="Title">
        <img
          alt="Telegram sticker"
          src="https://xelene.me/telegram.gif"
          style={{
            display: "block",
            height: "144px",
            width: "144px",
          }}
        />
      </Placeholder>
    </Modal>
  );
};

const FriendsPage: FC = () => {
  const [isOpen/*, setIsOpen*/] = useState(false);

  // const openPopup = () => {
  //   setIsOpen(true);
  // };

  return (
    <div>
      {/* <Button mode="bezeled" size="s" className="px-4" onClick={openPopup}>
        Friends Page
      </Button> */}
      <div className="mt-[10vh] w-full">
        <ShareModal isOpen={isOpen} />
      </div>
    </div>
  );
};

export default FriendsPage;
