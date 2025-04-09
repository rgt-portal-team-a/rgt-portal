import React from "react";
import { format } from "date-fns";
import { Message } from "@/api/services/messaging.service";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Check, CheckCheck, FileIcon, Download } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
}) => {
  const renderAttachment = () => {
    switch (message.type) {
      case "image":
        return (
          <div className="relative rounded-md overflow-hidden">
            <img
              src={message.fileUrl}
              alt={message.fileName || "Image"}
              className="max-w-[300px] max-h-[300px] object-contain"
            />
            <a
              href={message.fileUrl}
              download={message.fileName}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-2 right-2 bg-background/70 p-1.5 rounded-full cursor-pointer hover:bg-background/90 transition-colors"
            >
              <Download className="w-4 h-4 text-foreground" />
            </a>
          </div>
        );
      case "video":
        return (
          <video
            src={message.fileUrl}
            controls
            className="max-w-[300px] rounded-md"
          />
        );
      case "audio":
        return (
          <audio
            src={message.fileUrl}
            controls
            className="max-w-[300px] w-full my-1"
          />
        );
      case "file":
        return (
          <a
            href={message.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500 font-medium cursor-pointer group"
          >
            <FileIcon className="w-5 h-5" />
            <span className="underline group-hover:no-underline line-clamp-1">
              {message.fileName} (
              {message.fileSize
                ? (message.fileSize / 1024 / 1024).toFixed(2) + " MB"
                : "N/A"}
              )
            </span>
          </a>
        );
      default:
        return null;
    }
  };

  const hasAttachment = message.type && message.type !== "text";

  return (
    <div
      className={cn(
        "flex items-start gap-2 mb-3",
        isOwnMessage ? "flex-row-reverse" : "flex-row"
      )}
    >
      {!isOwnMessage && (
        <Avatar className="w-8 h-8 mt-1">
          <AvatarImage src={message.sender?.profileImage} />
          <AvatarFallback className="text-xs bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200">
            {message.sender?.username?.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "max-w-[70%]",
          isOwnMessage ? "items-end" : "items-start"
        )}
      >
        <Card
          className={cn(
            "px-3 py-2 shadow-sm",
            isOwnMessage
              ? "bg-gray-200 text-gray-800 rounded-2xl rounded-br-none"
              : "bg-muted text-foreground rounded-2xl rounded-bl-none",
            hasAttachment && "p-2 overflow-hidden"
          )}
        >
          {!isOwnMessage && message.sender && (
            <p className="text-xs font-semibold mb-1 text-gray-800">
              {message.sender.username}
            </p>
          )}

          {hasAttachment ? (
            renderAttachment()
          ) : (
            <div className="whitespace-pre-wrap break-words">
              {message.content}
            </div>
          )}

          <div
            className={cn(
              "flex items-center gap-1 text-xs mt-1",
              isOwnMessage ? "justify-end" : "justify-start",
              isOwnMessage
                ? "text-gray-800/70"
                : "text-muted-foreground"
            )}
          >
            <span className="text-[10px] text-gray-800/70">
              {format(new Date(message.createdAt), "p")}
            </span>
            {message.isEdited && <span className="text-[10px] text-gray-800/70">• edited</span>}
            {isOwnMessage &&
              (message.isRead ? (
                <CheckCheck className="w-3 h-3 text-blue-500" />
              ) : (
                <Check className="w-3 h-3" />
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
