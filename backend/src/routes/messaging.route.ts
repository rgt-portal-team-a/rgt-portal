import { Router } from "express";
import { MessagingController } from "@/controllers/messaging.controller";
import { AuthMiddleware } from "@/middleware/auth.middleware";
import { validateDto } from "@/middleware/validator.middleware";
import { 
  CreateMessageDto, 
  UpdateMessageDto, 
  CreateConversationDto, 
  UpdateConversationDto, 
  ConversationParticipantDto, 
  UpdateParticipantDto 
} from "@/dtos/message.dto";

const messagingRouter = Router();
const messagingController = new MessagingController();
const authMiddleware = new AuthMiddleware();

// Message routes
messagingRouter.post(
  "/messages", 
  authMiddleware.isAuthenticated, 
  validateDto(CreateMessageDto),
  messagingController.createMessage
);

messagingRouter.put(
  "/messages/:id", 
  authMiddleware.isAuthenticated, 
  validateDto(UpdateMessageDto),
  messagingController.updateMessage
);

messagingRouter.delete(
  "/messages/:id", 
  authMiddleware.isAuthenticated, 
  messagingController.deleteMessage
);

messagingRouter.get(
  "/conversations/:id/messages", 
  authMiddleware.isAuthenticated, 
  messagingController.getMessages
);

// Conversation routes
messagingRouter.post(
  "/conversations", 
  authMiddleware.isAuthenticated, 
  validateDto(CreateConversationDto),
  messagingController.createConversation
);

messagingRouter.put(
  "/conversations/:id", 
  authMiddleware.isAuthenticated, 
  validateDto(UpdateConversationDto),
  messagingController.updateConversation
);

messagingRouter.delete(
  "/conversations/:id", 
  authMiddleware.isAuthenticated, 
  messagingController.deleteConversation
);

messagingRouter.get(
  "/conversations/:id", 
  authMiddleware.isAuthenticated, 
  messagingController.getConversation
);

messagingRouter.get(
  "/conversations", 
  authMiddleware.isAuthenticated, 
  messagingController.getUserConversations
);

// Participant routes
messagingRouter.post(
  "/conversations/:id/participants", 
  authMiddleware.isAuthenticated, 
  validateDto(ConversationParticipantDto),
  messagingController.addParticipants
);

messagingRouter.delete(
  "/conversations/:id/participants", 
  authMiddleware.isAuthenticated, 
  messagingController.removeParticipants
);

messagingRouter.put(
  "/conversations/:id/participants/:participantId", 
  authMiddleware.isAuthenticated, 
  validateDto(UpdateParticipantDto),
  messagingController.updateParticipant
);

// Read status routes
messagingRouter.post(
  "/conversations/:id/read", 
  authMiddleware.isAuthenticated, 
  messagingController.markConversationAsRead
);

messagingRouter.get(
  "/conversations/:id/unread-count", 
  authMiddleware.isAuthenticated, 
  messagingController.getUnreadCount
);

export default messagingRouter; 
