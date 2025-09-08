import { Button, Card } from "@telegram-apps/telegram-ui";
import { CardCell } from "@telegram-apps/telegram-ui/dist/components/Blocks/Card/components/CardCell/CardCell";
import { FC } from "react";

const PromotionCard: FC = () => {
  return (
    <Card type="plain">
      <img
        alt="Dog"
        src="https://i.imgur.com/892vhef.jpeg"
        style={{
          width: "100%",
          height: "200px",
          objectFit: "cover",
        }}
      />
      <CardCell
        subtitle={"Game Discription"}
        after={
          <Button mode="bezeled" size="s" className="px-4">
            PLAY
          </Button>
        }
      >
        Game Name
      </CardCell>
    </Card>
  );
};

export default PromotionCard;
