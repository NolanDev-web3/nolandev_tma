import { type FC, useMemo } from "react";
import {
  Chat,
  initData,
  useLaunchParams,
  useSignal,
  type User,
} from "@telegram-apps/sdk-react";
import { List, Placeholder } from "@telegram-apps/telegram-ui";

import {
  DisplayData,
  type DisplayDataRow,
} from "@/components/DisplayData/DisplayData.tsx";

function getUserRows(user: User): DisplayDataRow[] {
  return [
    { title: "id", value: user.id.toString() },
    { title: "username", value: user.username },
    { title: "photo_url", value: user.photoUrl },
    { title: "last_name", value: user.lastName },
    { title: "first_name", value: user.firstName },
    { title: "is_bot", value: user.isBot },
    { title: "is_premium", value: user.isPremium },
    { title: "language_code", value: user.languageCode },
    { title: "allows_to_write_to_pm", value: user.allowsWriteToPm },
    { title: "added_to_attachment_menu", value: user.addedToAttachmentMenu },
  ];
}

export const InitDataPage: FC = () => {
  const initDataRaw = useLaunchParams().initDataRaw;


  const initDataRows = useMemo<DisplayDataRow[] | undefined>(() => {
    if (!initData || !initDataRaw) {
      return;
    }
    const hash = useSignal(initData.hash);
    const user = useSignal(initData.user);
    const authDate = useSignal(initData.authDate) as Date;
    const canSendAfterDate = useSignal(initData.canSendAfterDate) as Date;
    const canSendAfter = useSignal(initData.canSendAfter);
    const queryId = useSignal(initData.queryId);
    const startParam = useSignal(initData.startParam);
    const chatType = useSignal(initData.chatType);
    const chatInstance = useSignal(initData.chatInstance);

    return [
      { title: "raw", value: initDataRaw },
      { title: "user", value: user?.id + "  " + user?.username },
      { title: "auth_date", value: authDate.toLocaleString() },
      { title: "auth_date (raw)", value: authDate.getTime() / 1000 },
      { title: "hash", value: hash },
      { title: "can_send_after", value: canSendAfterDate?.toISOString() },
      { title: "can_send_after (raw)", value: canSendAfter },
      { title: "query_id", value: queryId },
      { title: "start_param", value: startParam },
      { title: "chat_type", value: chatType },
      { title: "chat_instance", value: chatInstance },
    ];
  }, [initData, initDataRaw]);

  const userRows = useMemo<DisplayDataRow[] | undefined>(() => {
    const user = useSignal(initData.user) as User;
    return initData && user ? getUserRows(user) : undefined;
  }, [initData]);

  const receiverRows = useMemo<DisplayDataRow[] | undefined>(() => {
    const receiver = useSignal(initData.receiver) as User;
    return initData && receiver
      ? getUserRows(receiver)
      : undefined;
  }, [initData]);

  const chatRows = useMemo<DisplayDataRow[] | undefined>(() => {
    if (!initData?.chat) {
      return;
    }
    const chat = useSignal(initData.chat) as Chat;
    const { id, title, type, username, photoUrl } = chat;

    return [
      { title: "id", value: id.toString() },
      { title: "title", value: title },
      { title: "type", value: type },
      { title: "username", value: username },
      { title: "photo_url", value: photoUrl },
    ];
  }, [initData]);

  if (!initDataRows) {
    return (
      <Placeholder
        header="Oops"
        description="Application was launched with missing init data"
      >
        <img
          alt="Telegram sticker"
          src="https://xelene.me/telegram.gif"
          style={{ display: "block", width: "144px", height: "144px" }}
        />
      </Placeholder>
    );
  }
  return (
    <List>
      <DisplayData header={"Init Data"} rows={initDataRows} />
      {userRows && <DisplayData header={"User"} rows={userRows} />}
      {receiverRows && <DisplayData header={"Receiver"} rows={receiverRows} />}
      {chatRows && <DisplayData header={"Chat"} rows={chatRows} />}
    </List>
  );
};
