import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";

export enum MessageType {
  TEXT = "text",
  IMAGE = "image",
  FILE = "file",
  SYSTEM = "system"
}

@Entity("messages")
export class Message {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: number;

  @Column({ type: "text" })
  content!: string;

  @Column({ type: "enum", enum: MessageType, default: MessageType.TEXT })
  type!: MessageType;

  @Column({ type: "boolean", default: false })
  isRead!: boolean;

  @Column({ type: "boolean", default: false })
  isEdited!: boolean;

  @Column({ type: "boolean", default: false })
  isDeleted!: boolean;

  @Column({ nullable: true, type: "text" })
  fileUrl?: string;

  @Column({ nullable: true, type: "text" })
  fileName?: string;

  @Column({ nullable: true, type: "text" })
  fileType?: string;

  @Column({ nullable: true, type: "bigint" })
  fileSize?: number;

  @Column({ type: "bigint" })
  senderId!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "sender_id" })
  sender!: User;

  @Column({ type: "bigint" })
  conversationId!: number;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
} 