import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";
import { Conversation } from "./conversation.entity";

@Entity("conversation_participants")
export class ConversationParticipant {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: number;

  @Column({ type: "bigint" })
  userId!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ type: "bigint" })
  conversationId!: number;

  @ManyToOne(() => Conversation)
  @JoinColumn({ name: "conversation_id" })
  conversation!: Conversation;

  @Column({ type: "boolean", default: false })
  isAdmin!: boolean;

  @Column({ type: "boolean", default: false })
  isMuted!: boolean;

  @Column({ type: "timestamp", nullable: true })
  lastReadAt!: Date;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
} 