import {Message} from "@api/dialog.api";

interface Props {
  message: Message;
  isOwn: boolean;
}

export function transformMessageToText({message, isOwn}: Props): string {
  const text = message.text
    ? message.text
    : message.attachments?.files
    ? "Files"
    : message.attachments?.images
    ? "Images"
    : message?.attachments?.audio
    ? "Audio"
    : "";

  return `${isOwn ? "You: " : ""}${text}`;
}