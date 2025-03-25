import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, OneToMany } from "typeorm";
import { Employee } from "./employee.entity";
import { PostComment } from "./post-comment.entity";
import { CommentLike } from "./post-comment-like.entity";

@Entity("comment_replies")
export class CommentReply {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: number;

  @ManyToOne(() => PostComment, (comment) => comment.replies)
  @JoinColumn({ name: "comment_id" })
  comment!: PostComment;

  @Column({ nullable: true, type: "bigint" })
  commentId!: number;

  @ManyToOne(() => CommentReply, (reply) => reply.childReplies, { nullable: true })
  @JoinColumn({ name: "parent_reply_id" })
  parentReply?: CommentReply;

  @Column({ nullable: true, type: "bigint" })
  parentReplyId?: number;

  @OneToMany(() => CommentReply, (reply) => reply.parentReply)
  childReplies!: CommentReply[];

  @ManyToOne(() => Employee)
  @JoinColumn({ name: "author_id" })
  author!: Employee;

  @Column({ nullable: true, type: "bigint" })
  authorId!: number;

  @Column({ type: "text" })
  content!: string;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @OneToMany(() => CommentLike, (like) => like.reply)
  likes!: CommentLike[];
}
