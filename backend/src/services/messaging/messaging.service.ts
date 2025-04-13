import { Not, MoreThan, Repository, In } from "typeorm";
import { Message, MessageType } from "@/entities/message.entity";
import { Conversation, ConversationType } from "@/entities/conversation.entity";
import { ConversationParticipant } from "@/entities/conversation-participant.entity";
import { User } from "@/entities/user.entity";
import { Department } from "@/entities/department.entity";
import { CreateMessageDto, CreateConversationDto, UpdateMessageDto, UpdateConversationDto, ConversationParticipantDto, UpdateParticipantDto } from "@/dtos/message.dto";
import { getSocketService } from "@/config/socket";
import { logger } from "@/config/logger.config";
import { AppDataSource } from "@/database/data-source";

export class MessagingService {
  private messageRepository: Repository<Message>;
  private conversationRepository: Repository<Conversation>;
  private conversationParticipantRepository: Repository<ConversationParticipant>;
  private userRepository: Repository<User>;
  private departmentRepository: Repository<Department>;

  constructor(
  ) {
    this.messageRepository = AppDataSource.getRepository(Message);
    this.conversationRepository = AppDataSource.getRepository(Conversation);
    this.conversationParticipantRepository = AppDataSource.getRepository(ConversationParticipant);
    this.userRepository = AppDataSource.getRepository(User);
    this.departmentRepository = AppDataSource.getRepository(Department);
  }

  public getUserOnlineStatus = async (userId: number): Promise<boolean> => {
    const socketService = getSocketService();
    return socketService.getUserOnlineStatus(userId);
  }

  // Message operations
  async createMessage(userId: number, dto: CreateMessageDto): Promise<Message> {
    const participant = await this.conversationParticipantRepository.findOne({
      where: { userId, conversationId: dto.conversationId }
    });

    if (!participant) {
      throw new Error("User is not a participant in this conversation");
    }

    const message = this.messageRepository.create({
      content: dto.content,
      type: dto.type || MessageType.TEXT,
      senderId: userId,
      conversationId: dto.conversationId,
      fileUrl: dto.fileUrl,
      fileName: dto.fileName,
      fileType: dto.fileType,
      fileSize: dto.fileSize
    });

    const savedMessage = await this.messageRepository.save(message);

    await this.conversationParticipantRepository.update(
      { userId, conversationId: dto.conversationId },
      { lastReadAt: new Date() }
    );

    const conversation = await this.getConversationById(dto.conversationId);
    if (conversation) {
      const socketService = getSocketService();
      
      conversation.participants.forEach(participant => {
        if (participant.user.id !== userId) {
          socketService.emitToUser(participant.user.id, "new_message", {
            message: savedMessage,
            conversation: conversation
          });
        }
      });
    }

    return savedMessage;
  }

  async updateMessage(userId: number, messageId: string, dto: UpdateMessageDto): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId }
    });

    if (!message) {
      throw new Error("Message not found");
    }

    if (message.senderId !== userId) {
      throw new Error("You can only edit your own messages");
    }

    message.content = dto.content;
    message.isEdited = true;

    const updatedMessage = await this.messageRepository.save(message);

    const conversation = await this.getConversationById(message.conversationId);
    if (conversation) {
      const socketService = getSocketService();
      
      conversation.participants.forEach(participant => {
        socketService.emitToUser(participant.user.id, "message_updated", {
          message: updatedMessage,
          conversationId: message.conversationId
        });
      });
    }

    return updatedMessage;
  }

  async deleteMessage(userId: number, messageId: string): Promise<void> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId }
    });

    if (!message) {
      throw new Error("Message not found");
    }

    if (message.senderId !== userId) {
      throw new Error("You can only delete your own messages");
    }

    // Soft delete
    message.isDeleted = true;
    await this.messageRepository.save(message);

    const conversation = await this.getConversationById(message.conversationId);
    if (conversation) {
      const socketService = getSocketService();
      
      conversation.participants.forEach(participant => {
        socketService.emitToUser(participant.user.id, "message_deleted", {
          messageId,
          conversationId: message.conversationId
        });
      });
    }
  }

  async getMessagesByConversationId(userId: number, conversationId: string, page = 1, limit = 50): Promise<{ messages: Message[]; total: number }> {
    const participant = await this.conversationParticipantRepository.findOne({
      where: { userId, conversationId }
    });

    if (!participant) {
      throw new Error("User is not a participant in this conversation");
    }

    const [messages, total] = await this.messageRepository.findAndCount({
      where: { conversationId },
      relations: ["sender"],
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit
    });

    await this.conversationParticipantRepository.update(
      { userId, conversationId },
      { lastReadAt: new Date() }
    );

    return { messages, total };
  }

  // Conversation operations
  async createConversation(userId: number, dto: CreateConversationDto): Promise<Conversation> {
    // Validate participants
    const participants = await this.userRepository.findByIds(dto.participantIds);
    if (participants.length !== dto.participantIds.length) {
      throw new Error("One or more participants not found");
    }

    // private conversations, check if a conversation already exists between the two users
    if (dto.type === ConversationType.PRIVATE && dto.participantIds.length === 2) {
      const existingConversation = await this.findPrivateConversation(userId, dto.participantIds[0]);
      if (existingConversation) {
        return existingConversation;
      }
    }

    //  department conversations, validate the department
    if (dto.type === ConversationType.DEPARTMENT && dto.departmentId) {
      const department = await this.departmentRepository.findOne({
        where: { id: dto.departmentId }
      });

      if (!department) {
        throw new Error("Department not found");
      }
    }

    // the conversation
    const conversation = this.conversationRepository.create({
      name: dto.name,
      type: dto.type,
      description: dto.description,
      avatar: dto.avatar,
      departmentId: dto.departmentId,
      department: { id: dto.departmentId },
      createdById: userId,
      createdBy: { id: userId }
    });

    const savedConversation = await this.conversationRepository.save(conversation);

    // participants
    const participantEntities = dto.participantIds.map(participantId => {
      return this.conversationParticipantRepository.create({
        userId: participantId,
        conversationId: savedConversation.id,
        user: { id: participantId },
        conversation: { id: savedConversation.id },
        isAdmin: participantId === userId 
      });
    });

    await this.conversationParticipantRepository.save(participantEntities);

    const socketService = getSocketService();
    dto.participantIds.forEach(participantId => {
      if (participantId !== userId) {
        socketService.emitToUser(participantId, "new_conversation", {
          conversation: savedConversation
        });
      }
    });

    return savedConversation;
  }

  async updateConversation(userId: number, conversationId: string, dto: UpdateConversationDto): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId }
    });

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const participant = await this.conversationParticipantRepository.findOne({
      where: { userId, conversationId, isAdmin: true }
    });

    if (!participant) {
      throw new Error("You don't have permission to update this conversation");
    }

    if (dto.name) conversation.name = dto.name;
    if (dto.description) conversation.description = dto.description;
    if (dto.avatar) conversation.avatar = dto.avatar;

    const updatedConversation = await this.conversationRepository.save(conversation);

    const participants = await this.conversationParticipantRepository.find({
      where: { conversationId }
    });

    const socketService = getSocketService();
    participants.forEach(participant => {
      socketService.emitToUser(participant.userId, "conversation_updated", {
        conversation: updatedConversation
      });
    });

    return updatedConversation;
  }

  async deleteConversation(userId: number, conversationId: string): Promise<void> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId }
    });

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const participant = await this.conversationParticipantRepository.findOne({
      where: { userId, conversationId, isAdmin: true }
    });

    if (!participant) {
      throw new Error("You don't have permission to delete this conversation");
    }

    await this.conversationRepository.delete(conversationId);

    const participants = await this.conversationParticipantRepository.find({
      where: { conversationId }
    });

    const socketService = getSocketService();
    participants.forEach(participant => {
      socketService.emitToUser(participant.userId, "conversation_deleted", {
        conversationId
      });
    });
  }

  async getConversationById(conversationId: string): Promise<Conversation | null> {
    console.log("conversationId", conversationId);
    return this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ["participants", "participants.user", "department"]
    });
  }

  async getUserConversations(userId: number): Promise<Conversation[]> {
    const participantRecords = await this.conversationParticipantRepository.find({
      where: { userId },
      relations: ["conversation"]
    });


    const conversationIds = participantRecords.map(record => record.conversationId);
    
    if (conversationIds.length === 0) {
      return [];
    }

    return this.conversationRepository.find({
      where: { id: In(conversationIds) },
      relations: ["participants",  "participants.user", "department"],
      order: { updatedAt: "DESC" }
    });
  }

  async findPrivateConversation(userId1: number, userId2: number): Promise<Conversation | null> {
    const participantRecords = await this.conversationParticipantRepository.find({
      where: { userId: userId1 },
      relations: ["conversation"]
    });

    const conversationIds = participantRecords.map(record => record.conversationId);
    
    if (conversationIds.length === 0) {
      return null;
    }

    const conversations = await this.conversationRepository.find({
      where: { id: In(conversationIds), type: ConversationType.PRIVATE },
      relations: ["participants", "participants.user"]
    });

    return conversations.find(conversation => {
      const participantIds = conversation.participants.map(p => p.user.id);
      return participantIds.includes(userId1) && participantIds.includes(userId2);
    }) || null;
  }

  // Participant operations
  async addParticipants(userId: number, conversationId: string, dto: ConversationParticipantDto[]): Promise<void> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId }
    });

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const adminParticipant = await this.conversationParticipantRepository.findOne({
      where: { userId, conversationId, isAdmin: true }
    });

    if (!adminParticipant) {
      throw new Error("You don't have permission to add participants to this conversation");
    }

    const participantIds = dto.map(p => p.userId);
    const users = await this.userRepository.findByIds(participantIds);
    if (users.length !== participantIds.length) {
      throw new Error("One or more participants not found");
    }

    const participantEntities = dto.map(p => {
      return this.conversationParticipantRepository.create({
        userId: p.userId,
        conversationId,
        isAdmin: p.isAdmin || false,
        isMuted: p.isMuted || false
      });
    });

    await this.conversationParticipantRepository.save(participantEntities);

    const socketService = getSocketService();
    
    const existingParticipants = await this.conversationParticipantRepository.find({
      where: { conversationId }
    });
    
    existingParticipants.forEach(participant => {
      socketService.emitToUser(participant.userId, "participants_added", {
        conversationId,
        newParticipants: dto
      });
    });
    
    participantIds.forEach(participantId => {
      socketService.emitToUser(participantId, "added_to_conversation", {
        conversation
      });
    });
  }

  async removeParticipants(userId: number, conversationId: string, participantIds: number[]): Promise<void> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId }
    });

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const adminParticipant = await this.conversationParticipantRepository.findOne({
      where: { userId, conversationId, isAdmin: true }
    });

    if (!adminParticipant) {
      throw new Error("You don't have permission to remove participants from this conversation");
    }

    await this.conversationParticipantRepository.delete({
      conversationId,
      userId: In(participantIds)
    });

    const socketService = getSocketService();
    
    const remainingParticipants = await this.conversationParticipantRepository.find({
      where: { conversationId }
    });
    
    remainingParticipants.forEach(participant => {
      socketService.emitToUser(participant.userId, "participants_removed", {
        conversationId,
        removedParticipants: participantIds
      });
    });
    
    participantIds.forEach(participantId => {
      socketService.emitToUser(participantId, "removed_from_conversation", {
        conversationId
      });
    });
  }

  async updateParticipant(userId: number, conversationId: string, participantId: string, dto: UpdateParticipantDto): Promise<void> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId }
    });

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const adminParticipant = await this.conversationParticipantRepository.findOne({
      where: { userId, conversationId, isAdmin: true }
    });

    if (!adminParticipant) {
      throw new Error("You don't have permission to update participants in this conversation");
    }
    await this.conversationParticipantRepository.update(
      { userId: Number(participantId), conversationId },
      dto
    );

    const socketService = getSocketService();
    
    const participants = await this.conversationParticipantRepository.find({
      where: { conversationId }
    });
    
    participants.forEach(participant => {
      socketService.emitToUser(participant.userId, "participant_updated", {
        conversationId,
        participantId,
        updates: dto
      });
    });
  }

  async markConversationAsRead(userId: number, conversationId: string): Promise<void> {
    const participant = await this.conversationParticipantRepository.findOne({
      where: { userId, conversationId }
    });

    if (!participant) {
      throw new Error("User is not a participant in this conversation");
    }

    await this.conversationParticipantRepository.update(
      { userId, conversationId },
      { lastReadAt: new Date() }
    );
  }

  async getUnreadCount(userId: number, conversationId: string): Promise<number> {
    const participant = await this.conversationParticipantRepository.findOne({
      where: { userId, conversationId }
    });

    if (!participant) {
      throw new Error("User is not a participant in this conversation");
    }

    const lastReadAt = participant.lastReadAt || new Date(0);

    return this.messageRepository.count({
      where: {
        conversationId,
        senderId: Not(userId),
        createdAt: MoreThan(lastReadAt),
        isDeleted: false
      }
    });
  }
} 