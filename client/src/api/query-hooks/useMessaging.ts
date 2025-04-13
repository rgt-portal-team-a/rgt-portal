/* eslint-disable @typescript-eslint/no-unused-vars */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { messagingService, CreateMessageDto, UpdateMessageDto, CreateConversationDto, UpdateConversationDto, ConversationParticipantDto, UpdateParticipantDto } from '../services/messaging.service';
  
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
    mutationFn: ({ messageId, dto }: { messageId: string; dto: UpdateMessageDto }) => 
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
    mutationFn: (messageId: string) => messagingService.deleteMessage(messageId),
    onSuccess: (_, messageId) => {
      // We need to find the conversation ID for this message
      // This is a bit tricky since we don't have it directly
      // We'll need to invalidate all message queries
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    }
  });
};

export const useMessages = (conversationId: string, page = 1, limit = 50) => {
  return useQuery({
    queryKey: ['messages', conversationId, page, limit],
    queryFn: () => messagingService.getMessages(conversationId, page, limit),
    enabled: !!conversationId,
  });
};

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
    mutationFn: ({ conversationId, dto }: { conversationId: string; dto: UpdateConversationDto }) => 
      messagingService.updateConversation(conversationId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });
};

export const useDeleteConversation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (conversationId: string) => messagingService.deleteConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });
};

export const useConversation = (conversationId: string) => {
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

export const useAddParticipants = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ conversationId, dto }: { conversationId: string; dto: ConversationParticipantDto[] }) => 
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
    mutationFn: ({ conversationId, participantIds }: { conversationId: string; participantIds:string[] }) => 
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
    mutationFn: ({ conversationId, participantId, dto }: { conversationId: string; participantId: string; dto: UpdateParticipantDto }) => 
      messagingService.updateParticipant(conversationId, participantId, dto),
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });
};

export const useMarkConversationAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (conversationId: string) => messagingService.markConversationAsRead(conversationId),
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });
};

export const useUnreadCount = (conversationId: string) => {
  return useQuery({
    queryKey: ['unreadCount', conversationId],
    queryFn: () => messagingService.getUnreadCount(conversationId),
    enabled: !!conversationId,
  });
}; 
