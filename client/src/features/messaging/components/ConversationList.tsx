import React from 'react';
import { format } from 'date-fns';
import { Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useConversations } from '@/api/query-hooks/useMessaging';
import { Conversation } from '@/api/services/messaging.service';
import { NewConversationDialog } from './NewConversationDialog';
import { useAuthContextProvider } from '@/hooks/useAuthContextProvider';
import { useParams } from 'react-router-dom';

interface ConversationListProps {
  selectedId?: number;
  onSelect: (conversation: Conversation) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({ selectedId, onSelect }) => {
    const [search, setSearch] = React.useState('');
    const { conversationId } = useParams<{ conversationId: string }>();
  const { data: conversationsData, isLoading } = useConversations();
  const conversations = conversationsData?.data || [];
  const { currentUser } = useAuthContextProvider();
  
  console.log("Selection debug:", { 
    selectedId, 
    conversationId, 
    currentConversations: conversations.map(c => c.id)
  });
  
  const filteredConversations = conversations.filter(conversation => {
    const searchLower = search.toLowerCase();
    return (
      conversation.name?.toLowerCase().includes(searchLower) ||
      conversation.participants.some(p => 
        p.user.username?.toLowerCase().includes(searchLower) ||
        p.user.email?.toLowerCase().includes(searchLower)
      )
    );
  });
    
    

  const getConversationName = (conversation: Conversation) => {
    if (conversation.name) return conversation.name;
    if (conversation.type === 'private') {
      const otherParticipant = conversation.participants.find(p => p.user.id !== currentUser?.id);
      return otherParticipant?.user.username || 'Unknown User';
    }
    return 'Unnamed Conversation';
  };

  const getAvatarInfo = (conversation: Conversation) => {
    if (conversation.avatar) {
      return {
        image: conversation.avatar,
        fallback: getConversationName(conversation).charAt(0).toUpperCase()
      };
    }

    if (conversation.type === 'private') {
      const otherParticipant = conversation.participants.find(p => p.user.id !== currentUser?.id);
      return {
        image: otherParticipant?.user.profileImage,
        fallback: otherParticipant?.user.username.charAt(0).toUpperCase() || 'U'
      };
    }

    return {
      image: null,
      fallback: getConversationName(conversation).charAt(0).toUpperCase()
    };
  };

  return (
    <div className="w-80 border-r flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Messages</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="icon" variant="ghost">
                <Plus className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Conversation</DialogTitle>
              </DialogHeader>
              <NewConversationDialog />
            </DialogContent>
          </Dialog>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground">
            Loading conversations...
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No conversations found
          </div>
        ) : (
          filteredConversations.map(conversation => {
            const avatarInfo = getAvatarInfo(conversation);
            return (
              <button
                key={conversation.id}
                onClick={() => onSelect(conversation)}
                className={`w-full p-4 flex items-center gap-3 cursor-pointer hover:bg-accent transition-colors ${
                  (selectedId === conversation.id || parseInt(conversationId || '') === conversation.id) ? 'bg-accent' : ''
                }`}
              >
                <Avatar>
                  <AvatarImage src={avatarInfo.image || undefined} />
                  <AvatarFallback>{avatarInfo.fallback}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium truncate">
                      {getConversationName(conversation)}
                    </p>
                    {conversation.lastMessage && (
                      <p className="text-xs text-muted-foreground shrink-0">
                        {format(new Date(conversation.lastMessage.createdAt), 'HH:mm')}
                      </p>
                    )}
                  </div>

                  {conversation.lastMessage && (
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.lastMessage.content}
                    </p>
                  )}

                  {conversation.unreadCount ? (
                    <div className="mt-1 inline-flex items-center justify-center w-5 h-5 text-xs bg-primary text-primary-foreground rounded-full">
                      {conversation.unreadCount}
                    </div>
                  ) : null}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}; 