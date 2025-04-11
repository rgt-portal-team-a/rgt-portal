import axios from '../axios';
import { ApiResponse } from '../types';

export interface Message {
  id: number;
  content: string;
  type: 'text' | 'image' | 'file' | 'audio' | 'video';
  senderId: number;
  conversationId: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  isRead: boolean;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  sender?: {
    id: number;
    username: string;
    email: string;
    profileImage?: string;
  };
}

export interface Conversation {
  id: string;
  name?: string;
  type: 'private' | 'group' | 'department';
  description?: string;
  avatar?: string;
  departmentId?: number;
  department?: {
    id: number;
    name: string;
  };
  createdById: number;
  createdBy?: {
    id: number;
    username: string;
    email: string;
    profileImage?: string;
  };
  participants: {
    id: string;
    username: string;
    email: string;
    profileImage?: string;
    isAdmin: boolean;
    isMuted: boolean;
    lastReadAt?: string;
    user: {
      id: number;
      username: string;
      email: string;
      profileImage?: string;
    };
  }[];
  lastMessage?: Message;
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMessageDto {
  content: string;
  type?: 'text' | 'image' | 'file' | 'audio' | 'video';
  conversationId: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
}

export interface UpdateMessageDto {
  content: string;
}

export interface CreateConversationDto {
  name?: string;
  type: 'private' | 'group' | 'department';
  description?: string;
  avatar?: string;
  departmentId?: number;
  participantIds: string[];
}

export interface UpdateConversationDto {
  name?: string;
  description?: string;
  avatar?: string;
}

export interface ConversationParticipantDto {
  userId: number;
  isAdmin?: boolean;
  isMuted?: boolean;
}

export interface UpdateParticipantDto {
  isAdmin?: boolean;
  isMuted?: boolean;
}

const API_URL =
  import.meta.env.VITE_NODE_ENV === "development"
    ? import.meta.env.VITE_DEV_API_URL
    : import.meta.env.VITE_API_URL;

class MessagingService {
  // Message operations
  async createMessage(dto: CreateMessageDto): Promise<ApiResponse<Message>> {
    const response = await axios.post<ApiResponse<Message>>(`${API_URL}/messaging/messages`, dto);
    return response.data;
  }

  async updateMessage(messageId: string, dto: UpdateMessageDto): Promise<ApiResponse<Message>> {
    const response = await axios.put<ApiResponse<Message>>(`${API_URL}/messaging/messages/${messageId}`, dto);
    return response.data;
  }

  async deleteMessage(messageId: string): Promise<ApiResponse<null>> {
    const response = await axios.delete<ApiResponse<null>>(`${API_URL}/messaging/messages/${messageId}`);
    return response.data;
  }

  async getMessages(conversationId: string, page = 1, limit = 50): Promise<ApiResponse<{ messages: Message[]; total: number }>> {
    const response = await axios.get<ApiResponse<{ messages: Message[]; total: number }>>(
      `${API_URL}/messaging/conversations/${conversationId}/messages?page=${page}&limit=${limit}`
    );
    return response.data;
  }

  // Conversation operations
  async createConversation(dto: CreateConversationDto): Promise<ApiResponse<Conversation>> {
    const response = await axios.post<ApiResponse<Conversation>>(`${API_URL}/messaging/conversations`, dto);
    return response.data;
  }

  async updateConversation(conversationId: string, dto: UpdateConversationDto): Promise<ApiResponse<Conversation>> {
    const response = await axios.put<ApiResponse<Conversation>>(`${API_URL}/messaging/conversations/${conversationId}`, dto);
    return response.data;
  }

  async deleteConversation(conversationId: string): Promise<ApiResponse<null>> {
    const response = await axios.delete<ApiResponse<null>>(`${API_URL}/messaging/conversations/${conversationId}`);
    return response.data;
  }

  async getConversation(conversationId: string): Promise<ApiResponse<Conversation>> {
    const response = await axios.get<ApiResponse<Conversation>>(`${API_URL}/messaging/conversations/${conversationId}`);
    return response.data;
  }

  async getUserConversations(): Promise<ApiResponse<Conversation[]>> {
    const response = await axios.get<ApiResponse<Conversation[]>>(`${API_URL}/messaging/conversations`);
    return response.data;
  }

  // Participant operations
  async addParticipants(conversationId: string, dto: ConversationParticipantDto[]): Promise<ApiResponse<null>> {
    const response = await axios.post<ApiResponse<null>>(`${API_URL}/messaging/conversations/${conversationId}/participants`, dto);
    return response.data;
  }

  async removeParticipants(conversationId: string, participantIds: string[]): Promise<ApiResponse<null>> {
    const response = await axios.delete<ApiResponse<null>>(`${API_URL}/messaging/conversations/${conversationId}/participants`, {
      data: { participantIds }
    });
    return response.data;
  }

  async updateParticipant(conversationId: string, participantId: string, dto: UpdateParticipantDto): Promise<ApiResponse<null>> {
    const response = await axios.put<ApiResponse<null>>(`${API_URL}/messaging/conversations/${conversationId}/participants/${participantId}`, dto);
    return response.data;
  }

  // Read status operations
  async markConversationAsRead(conversationId: string): Promise<ApiResponse<null>> {
    const response = await axios.post<ApiResponse<null>>(`${API_URL}/messaging/conversations/${conversationId}/read`);
    return response.data;
  }

  async getUnreadCount(conversationId: string): Promise<ApiResponse<{ count: number }>> {
    const response = await axios.get<ApiResponse<{ count: number }>>(`${API_URL}/messaging/conversations/${conversationId}/unread-count`);
    return response.data;
  }
}

export const messagingService = new MessagingService(); 