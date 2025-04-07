import { Request, Response } from "express";
import { MessagingService } from "@/services/messaging/messaging.service";
import { ApiResponse } from "@/dtos/response.dto";
import { Logger } from "@/services/logger.service";
import { CreateMessageDto, CreateConversationDto, UpdateMessageDto, UpdateConversationDto, ConversationParticipantDto, UpdateParticipantDto } from "@/dtos/message.dto";

export class MessagingController {
  private messagingService: MessagingService;
  private logger: Logger;

  constructor() {
    this.messagingService = new MessagingService();
    this.logger = new Logger("MessagingController");
  }

  // Message endpoints
  public createMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any).id;
      const messageDto = req.body as CreateMessageDto;
      
      const message = await this.messagingService.createMessage(userId, messageDto);
      
      const response: ApiResponse<typeof message> = {
        success: true,
        data: message,
        message: "Message created successfully",
      };
      
      res.status(201).json(response);
    } catch (error) {
      this.logger.error("Error creating message:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create message",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public updateMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any).id;
      const messageId = parseInt(req.params.id);
      
      if (isNaN(messageId)) {
        res.status(400).json({
          success: false,
          message: "Invalid message ID",
        });
        return;
      }
      
      const updateDto = req.body as UpdateMessageDto;
      
      const message = await this.messagingService.updateMessage(userId, messageId, updateDto);
      
      const response: ApiResponse<typeof message> = {
        success: true,
        data: message,
        message: "Message updated successfully",
      };
      
      res.status(200).json(response);
    } catch (error) {
      this.logger.error("Error updating message:", error);
      
      if (error instanceof Error && error.message.includes("not found")) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: "Failed to update message",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public deleteMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any).id;
      const messageId = parseInt(req.params.id);
      
      if (isNaN(messageId)) {
        res.status(400).json({
          success: false,
          message: "Invalid message ID",
        });
        return;
      }
      
      await this.messagingService.deleteMessage(userId, messageId);
      
      const response: ApiResponse<null> = {
        success: true,
        data: null,
        message: "Message deleted successfully",
      };
      
      res.status(200).json(response);
    } catch (error) {
      this.logger.error("Error deleting message:", error);
      
      if (error instanceof Error && error.message.includes("not found")) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: "Failed to delete message",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public getMessages = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any).id;
      const conversationId = parseInt(req.params.id);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      
      if (isNaN(conversationId)) {
        res.status(400).json({
          success: false,
          message: "Invalid conversation ID",
        });
        return;
      }
      
      const result = await this.messagingService.getMessagesByConversationId(userId, conversationId, page, limit);
      
      const response: ApiResponse<typeof result.messages> = {
        success: true,
        data: result.messages,
        message: "Messages retrieved successfully",
        metadata: {
          page,
          totalPages: Math.ceil(result.total / limit),
          total: result.total
        }
      };
      
      res.status(200).json(response);
    } catch (error) {
      this.logger.error("Error fetching messages:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch messages",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // Conversation endpoints
  public createConversation = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any).id;
      const conversationDto = req.body as CreateConversationDto;
      
      const conversation = await this.messagingService.createConversation(userId, conversationDto);
      
      const response: ApiResponse<typeof conversation> = {
        success: true,
        data: conversation,
        message: "Conversation created successfully",
      };
      
      res.status(201).json(response);
    } catch (error) {
      this.logger.error("Error creating conversation:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create conversation",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public updateConversation = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any).id;
      const conversationId = parseInt(req.params.id);
      
      if (isNaN(conversationId)) {
        res.status(400).json({
          success: false,
          message: "Invalid conversation ID",
        });
        return;
      }
      
      const updateDto = req.body as UpdateConversationDto;
      
      const conversation = await this.messagingService.updateConversation(userId, conversationId, updateDto);
      
      const response: ApiResponse<typeof conversation> = {
        success: true,
        data: conversation,
        message: "Conversation updated successfully",
      };
      
      res.status(200).json(response);
    } catch (error) {
      this.logger.error("Error updating conversation:", error);
      
      if (error instanceof Error && error.message.includes("not found")) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: "Failed to update conversation",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public deleteConversation = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any).id;
      const conversationId = parseInt(req.params.id);
      
      if (isNaN(conversationId)) {
        res.status(400).json({
          success: false,
          message: "Invalid conversation ID",
        });
        return;
      }
      
      await this.messagingService.deleteConversation(userId, conversationId);
      
      const response: ApiResponse<null> = {
        success: true,
        data: null,
        message: "Conversation deleted successfully",
      };
      
      res.status(200).json(response);
    } catch (error) {
      this.logger.error("Error deleting conversation:", error);
      
      if (error instanceof Error && error.message.includes("not found")) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: "Failed to delete conversation",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public getConversation = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any).id;
      const conversationId = parseInt(req.params.id);
      
      if (isNaN(conversationId)) {
        res.status(400).json({
          success: false,
          message: "Invalid conversation ID",
        });
        return;
      }
      
      const conversation = await this.messagingService.getConversationById(conversationId);
      
      if (!conversation) {
        res.status(404).json({
          success: false,
          message: "Conversation not found",
        });
        return;
      }
      
      const response: ApiResponse<typeof conversation> = {
        success: true,
        data: conversation,
        message: "Conversation retrieved successfully",
      };
      
      res.status(200).json(response);
    } catch (error) {
      this.logger.error("Error fetching conversation:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch conversation",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public getUserConversations = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any).id;
      
      const conversations = await this.messagingService.getUserConversations(userId);
      
      const response: ApiResponse<typeof conversations> = {
        success: true,
        data: conversations,
        message: "User conversations retrieved successfully",
      };
      
      res.status(200).json(response);
    } catch (error) {
      this.logger.error("Error fetching user conversations:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch user conversations",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // Participant endpoints
  public addParticipants = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any).id;
      const conversationId = parseInt(req.params.id);
      
      if (isNaN(conversationId)) {
        res.status(400).json({
          success: false,
          message: "Invalid conversation ID",
        });
        return;
      }
      
      const participantsDto = req.body as ConversationParticipantDto;
      
      await this.messagingService.addParticipants(userId, conversationId, [participantsDto]);
      
      const response: ApiResponse<null> = {
        success: true,
        data: null,
        message: "Participants added successfully",
      };
      
      res.status(200).json(response);
    } catch (error) {
      this.logger.error("Error adding participants:", error);
      
      if (error instanceof Error && error.message.includes("not found")) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: "Failed to add participants",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public removeParticipants = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any).id;
      const conversationId = parseInt(req.params.id);
      const participantIds: number[] = req.body.participantIds;
      
      if (isNaN(conversationId)) {
        res.status(400).json({
          success: false,
          message: "Invalid conversation ID",
        });
        return;
      }
      
      if (!Array.isArray(participantIds) || participantIds.length === 0) {
        res.status(400).json({
          success: false,
          message: "Participant IDs array is required",
        });
        return;
      }
      
      await this.messagingService.removeParticipants(userId, conversationId, participantIds);
      
      const response: ApiResponse<null> = {
        success: true,
        data: null,
        message: "Participants removed successfully",
      };
      
      res.status(200).json(response);
    } catch (error) {
      this.logger.error("Error removing participants:", error);
      
      if (error instanceof Error && error.message.includes("not found")) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: "Failed to remove participants",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public updateParticipant = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any).id;
      const conversationId = parseInt(req.params.id);
      const participantId = parseInt(req.params.participantId);
      
      if (isNaN(conversationId) || isNaN(participantId)) {
        res.status(400).json({
          success: false,
          message: "Invalid conversation ID or participant ID",
        });
        return;
      }
      
      const updateDto = req.body as UpdateParticipantDto;
      
      await this.messagingService.updateParticipant(userId, conversationId, participantId, updateDto);
      
      const response: ApiResponse<null> = {
        success: true,
        data: null,
        message: "Participant updated successfully",
      };
      
      res.status(200).json(response);
    } catch (error) {
      this.logger.error("Error updating participant:", error);
      
      if (error instanceof Error && error.message.includes("not found")) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: "Failed to update participant",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public markConversationAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any).id;
      const conversationId = parseInt(req.params.id);
      
      if (isNaN(conversationId)) {
        res.status(400).json({
          success: false,
          message: "Invalid conversation ID",
        });
        return;
      }
      
      await this.messagingService.markConversationAsRead(userId, conversationId);
      
      const response: ApiResponse<null> = {
        success: true,
        data: null,
        message: "Conversation marked as read",
      };
      
      res.status(200).json(response);
    } catch (error) {
      this.logger.error("Error marking conversation as read:", error);
      
      if (error instanceof Error && error.message.includes("not found")) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: "Failed to mark conversation as read",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public getUnreadCount = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any).id;
      const conversationId = parseInt(req.params.id);
      
      if (isNaN(conversationId)) {
        res.status(400).json({
          success: false,
          message: "Invalid conversation ID",
        });
        return;
      }
      
      const count = await this.messagingService.getUnreadCount(userId, conversationId);
      
      const response: ApiResponse<{ count: number }> = {
        success: true,
        data: { count },
        message: "Unread count retrieved successfully",
      };
      
      res.status(200).json(response);
    } catch (error) {
      this.logger.error("Error getting unread count:", error);
      
      if (error instanceof Error && error.message.includes("not found")) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: "Failed to get unread count",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
} 