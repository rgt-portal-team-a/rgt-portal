import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, OneToMany, JoinTable, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./user.entity";
import { Message } from "./message.entity";
import { Department } from "./department.entity";

export enum ConversationType {
  PRIVATE = "private",
  GROUP = "group",
  DEPARTMENT = "department"
}

@Entity("conversations")
export class Conversation {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: number;

  @Column({ type: "varchar", nullable: true })
  name!: string;

  @Column({ type: "enum", enum: ConversationType, default: ConversationType.PRIVATE })
  type!: ConversationType;

  @Column({ type: "text", nullable: true })
  description!: string;

  @Column({ type: "text", nullable: true })
  avatar!: string;

  @Column({ type: "bigint", nullable: true })
  departmentId!: number;

  @ManyToOne(() => Department)
  @JoinColumn({ name: "department_id" })
  department!: Department;

  @Column({ type: "bigint" })
  createdById!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "created_by_id" })
  createdBy!: User;

  @ManyToMany(() => User)
  @JoinTable({
    name: "conversation_participants",
    joinColumn: { name: "conversation_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "user_id", referencedColumnName: "id" }
  })
  participants!: User[];

  @OneToMany(() => Message, (message) => message.conversationId)
  messages!: Message[];

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
} 