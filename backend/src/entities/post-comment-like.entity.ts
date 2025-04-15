import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { Employee } from "./employee.entity";
import { PostComment } from "./post-comment.entity";
import { CommentReply } from "./post-comment-reply.entity";

@Entity("comment_likes")
export class CommentLike {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: number;

  @ManyToOne(() => PostComment, (comment) => comment.likes, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "comment_id" })
  comment?: PostComment;

  @Column({ nullable: true, type: "bigint" })
  commentId?: number;

  @ManyToOne(() => CommentReply, (reply) => reply.likes, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "reply_id" })
  reply?: CommentReply;

  @Column({ nullable: true, type: "bigint" })
  replyId?: number;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: "employee_id" })
  employee!: Employee;

  @Column({ nullable: true, type: "bigint" })
  employeeId!: number;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;
}
