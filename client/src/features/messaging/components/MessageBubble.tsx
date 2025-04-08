import React from 'react';
import { format } from 'date-fns';
import { Message } from '@/api/services/messaging.service';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Check, CheckCheck, FileIcon, Image as ImageIcon, Mic, Video } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwnMessage }) => {
  const getMessageIcon = () => {
    switch (message.type) {
      case 'IMAGE':
        return <ImageIcon className="w-4 h-4" />;
      case 'VIDEO':
        return <Video className="w-4 h-4" />;
      case 'AUDIO':
        return <Mic className="w-4 h-4" />;
      case 'FILE':
        return <FileIcon className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const renderContent = () => {
    switch (message.type) {
      case 'IMAGE':
        return (
          <div className="relative">
            <img 
              src={message.fileUrl} 
              alt={message.fileName || 'Image'} 
              className="max-w-[300px] rounded-lg"
            />
          </div>
        );
      case 'VIDEO':
        return (
          <video 
            src={message.fileUrl} 
            controls 
            className="max-w-[300px] rounded-lg"
          />
        );
      case 'AUDIO':
        return (
          <audio 
            src={message.fileUrl} 
            controls 
            className="max-w-[300px]"
          />
        );
      case 'FILE':
        return (
          <a 
            href={message.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
          >
            <FileIcon className="w-4 h-4" />
            <span>{message.fileName}</span>
          </a>
        );
      default:
        return <p className="whitespace-pre-wrap">{message.content}</p>;
    }
  };

  return (
    <div className={cn(
      "flex items-end gap-2 mb-4",
      isOwnMessage ? "flex-row-reverse" : "flex-row"
    )}>
      {!isOwnMessage && (
        <Avatar className="w-8 h-8">
          <AvatarImage src={message.sender?.profileImage} />
          <AvatarFallback>
            {message.sender?.username?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}

      <Card className={cn(
        "max-w-[70%] px-4 py-2 shadow-sm",
        isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted",
        message.type !== 'TEXT' && "overflow-hidden"
      )}>
        {!isOwnMessage && message.sender && (
          <p className="text-xs font-medium mb-1 text-primary">
            {message.sender.username}
          </p>
        )}
        
        <div className="flex items-end gap-2">
          <div className="flex-1">
            {renderContent()}
          </div>
          
          <div className="flex items-center gap-1 text-xs opacity-70">
            <span>{format(new Date(message.createdAt), 'HH:mm')}</span>
            {isOwnMessage && (
              message.isRead ? <CheckCheck className="w-4 h-4" /> : <Check className="w-4 h-4" />
            )}
          </div>
        </div>

        {message.isEdited && (
          <p className="text-xs opacity-70 mt-1">
            (edited)
          </p>
        )}
      </Card>
    </div>
  );
}; 