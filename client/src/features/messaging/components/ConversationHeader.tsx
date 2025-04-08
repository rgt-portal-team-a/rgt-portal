import React from 'react';
import { MoreVertical, Phone, Video } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Conversation } from '@/api/services/messaging.service';
import { useAuthContextProvider } from '@/hooks/useAuthContextProvider';

interface ConversationHeaderProps {
  conversation: Conversation;
  onVideoCall?: () => void;
  onVoiceCall?: () => void;
}

export const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  conversation,
  onVideoCall,
  onVoiceCall
}) => {
  const { currentUser } = useAuthContextProvider();

  const getConversationName = () => {
    if (conversation.name) return conversation.name;
      if (conversation.type === 'private') {
      const otherParticipant = conversation.participants.find(p => p.user?.id !== currentUser?.id);
      return otherParticipant?.user?.username || 'Unknown User';
    }
    return 'Unnamed Conversation';
  };

  const getParticipantStatus = () => {
    if (conversation.type === 'private') {
      return 'Online'; // TODO: Implement real online status
    }
    return `${conversation.participants.length} participants`;
  };

  const getAvatarInfo = () => {
    if (conversation.avatar) {
      return {
        image: conversation.avatar,
        fallback: getConversationName().charAt(0).toUpperCase()
      };
    }

      if (conversation.type === 'private') {
      const otherParticipant = conversation.participants.find(p => p.user?.id !== currentUser?.id);
      return {
        image: otherParticipant?.user?.profileImage,
        fallback: otherParticipant?.user?.username.charAt(0).toUpperCase() || 'U'
      };
    }

    return {
      image: null,
      fallback: getConversationName().charAt(0).toUpperCase()
    };
  };

  const avatarInfo = getAvatarInfo();

  return (
    <div className="h-16 border-b flex items-center justify-between px-4 bg-background rounded-t-xl">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={avatarInfo.image || undefined} />
          <AvatarFallback>{avatarInfo.fallback}</AvatarFallback>
        </Avatar>

        <div>
          <h3 className="font-medium">{getConversationName()}</h3>
          <p className="text-sm text-muted-foreground">
            {getParticipantStatus()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {conversation.type === 'private' && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={onVoiceCall}
              className="text-muted-foreground hover:text-foreground"
            >
              <Phone className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onVideoCall}
              className="text-muted-foreground hover:text-foreground"
            >
              <Video className="w-5 h-5" />
            </Button>
          </>
        )}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
            >
              <MoreVertical className="w-5 h-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48">
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start">
                View Profile
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                Mute Notifications
              </Button>
              <Button variant="ghost" className="w-full justify-start text-destructive">
                Leave Conversation
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}; 