import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMessages, useConversation, useMarkConversationAsRead } from '@/api/query-hooks/useMessaging';
import { ConversationList } from '../components/ConversationList';
import { ConversationHeader } from '../components/ConversationHeader';
import { MessageBubble } from '../components/MessageBubble';
import { MessageInput } from '../components/MessageInput';
import { Message } from '@/api/services/messaging.service';
import { useAuthContextProvider } from '@/hooks/useAuthContextProvider';

export const MessagingPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const [page] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedId = conversationId ? parseInt(conversationId) : undefined;
  const { currentUser } = useAuthContextProvider();
console.log("selectedId", selectedId);

  const { data: conversationData } = useConversation(selectedId || 0);
  const { data: messagesData, isLoading: isLoadingMessages } = useMessages(selectedId || 0, page);
  const markAsRead = useMarkConversationAsRead();

  const conversation = conversationData?.data;
  const messages = messagesData?.data?.messages || [];
  const currentUserId = currentUser?.id;

  useEffect(() => {
    if (selectedId) {
      markAsRead.mutate(selectedId);
    }
  }, [selectedId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleConversationSelect = (conversation: { id: number }) => {
    navigate(`/emp/messages/${conversation.id}`);
  };

  const isOwnMessage = (message: Message) => {
    return message.senderId === currentUserId;
  };

  return (
    <div className="flex h-[95%] mb-5  bg-background rounded-xl">
      <ConversationList
        selectedId={selectedId}
        onSelect={handleConversationSelect}
      />

      {selectedId && conversation ? (
        <div className="flex-1 flex flex-col rounded-xl">
          <ConversationHeader
            conversation={conversation}
            onVideoCall={() => {
              // TODO: Implement video call
              console.log('Video call');
            }}
            onVoiceCall={() => {
              // TODO: Implement voice call
              console.log('Voice call');
            }}
          />

          <div className="flex-1 overflow-y-auto p-4 rounded-xl">
            {isLoadingMessages ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Loading messages...
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No messages yet. Start a conversation!
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwnMessage={isOwnMessage(message)}
                  />
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <MessageInput
            conversationId={selectedId}
            onSend={() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          Select a conversation to start messaging
        </div>
      )}
    </div>
  );
}; 