import { MessageType } from "@/entities/message.entity";
import { ConversationType } from "@/entities/conversation.entity";
import { IsString, IsOptional, IsNumber, IsEnum, IsArray, IsNotEmpty, IsBoolean, IsDate, IsObject, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty({ message: "Content is required" })
  content!: string;

  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;

  @IsString()
  @IsNotEmpty({ message: "Conversation ID is required" })
  conversationId!: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsString()
  fileType?: string;

  @IsOptional()
  @IsNumber()
  fileSize?: number;
}

export class UpdateMessageDto {
  @IsString()
  @IsNotEmpty({ message: "Content is required" })
  content!: string;
}

export class MessageResponseDto {
  id!: string;
  content!: string;
  type!: MessageType;
  isRead!: boolean;
  isEdited!: boolean;
  isDeleted!: boolean;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  senderId!: number;
  sender!: {
    id: number;
    username: string;
    email: string;
    profileImage?: string;
  };
  conversationId!: number;
  createdAt!: Date;
  updatedAt!: Date;
}

export class CreateConversationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsEnum(ConversationType, { message: "Valid conversation type is required" })
  type!: ConversationType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsNumber()
  departmentId?: number;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty({ message: "At least one participant is required" })
  participantIds!: number[];
}

export class UpdateConversationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}

export class ConversationResponseDto {
  id!: string;
  name?: string;
  type!: ConversationType;
  description?: string;
  avatar?: string;
  departmentId?: number;
  department?: {
    id: number;
    name: string;
  };
  createdById!: number;
  createdBy!: {
    id: number;
    username: string;
    email: string;
    profileImage?: string;
  };
  participants!: {
    id: number;
    username: string;
    email: string;
    profileImage?: string;
    isAdmin: boolean;
    isMuted: boolean;
    lastReadAt?: Date;
  }[];
  lastMessage?: MessageResponseDto;
  unreadCount?: number;
  createdAt!: Date;
  updatedAt!: Date;
}

export class ConversationParticipantDto {
  @IsNumber({}, { message: "User ID is required" })
  userId!: number;

  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;

  @IsOptional()
  @IsBoolean()
  isMuted?: boolean;
}

export class UpdateParticipantDto {
  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;

  @IsOptional()
  @IsBoolean()
  isMuted?: boolean;
} 