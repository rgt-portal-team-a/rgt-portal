import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { messagingService, Message, Conversation, CreateMessageDto, UpdateMessageDto, CreateConversationDto, UpdateConversationDto, ConversationParticipantDto, UpdateParticipantDto } from '../services/messaging.service';

// Message hooks
export const useCreateMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (dto: CreateMessageDto) => messagingService.createMessage(dto),
    onSuccess: (_, variables) => {
      // Invalidate the messages query for this conversation
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
      // Invalidate the conversations query to update the last message
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });
};

export const useUpdateMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ messageId, dto }: { messageId: number; dto: UpdateMessageDto }) => 
      messagingService.updateMessage(messageId, dto),
    onSuccess: (data) => {
      // Invalidate the messages query for this conversation
      queryClient.invalidateQueries({ queryKey: ['messages', data.data.conversationId] });
    }
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (messageId: number) => messagingService.deleteMessage(messageId),
    onSuccess: (_, messageId) => {
      // We need to find the conversation ID for this message
      // This is a bit tricky since we don't have it directly
      // We'll need to invalidate all message queries
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    }
  });
};

export const useMessages = (conversationId: number, page = 1, limit = 50) => {
  return useQuery({
    queryKey: ['messages', conversationId, page, limit],
    queryFn: () => messagingService.getMessages(conversationId, page, limit),
    enabled: !!conversationId,
  });
};

// Conversation hooks
export const useCreateConversation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (dto: CreateConversationDto) => messagingService.createConversation(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });
};

export const useUpdateConversation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ conversationId, dto }: { conversationId: number; dto: UpdateConversationDto }) => 
      messagingService.updateConversation(conversationId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });
};

export const useDeleteConversation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (conversationId: number) => messagingService.deleteConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });
};

export const useConversation = (conversationId: number) => {
  return useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => messagingService.getConversation(conversationId),
    enabled: !!conversationId,
  });
};

export const useConversations = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => messagingService.getUserConversations(),
  });
};

// Participant hooks
export const useAddParticipants = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ conversationId, dto }: { conversationId: number; dto: ConversationParticipantDto[] }) => 
      messagingService.addParticipants(conversationId, dto),
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });
};

export const useRemoveParticipants = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ conversationId, participantIds }: { conversationId: number; participantIds: number[] }) => 
      messagingService.removeParticipants(conversationId, participantIds),
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });
};

export const useUpdateParticipant = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ conversationId, participantId, dto }: { conversationId: number; participantId: number; dto: UpdateParticipantDto }) => 
      messagingService.updateParticipant(conversationId, participantId, dto),
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });
};

// Read status hooks
export const useMarkConversationAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (conversationId: number) => messagingService.markConversationAsRead(conversationId),
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });
};

export const useUnreadCount = (conversationId: number) => {
  return useQuery({
    queryKey: ['unreadCount', conversationId],
    queryFn: () => messagingService.getUnreadCount(conversationId),
    enabled: !!conversationId,
  });
}; 