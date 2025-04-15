import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from "typeorm";
import { Employee } from "./employee.entity";
import { Post } from "./post.entity";
import { CommentReply } from "./post-comment-reply.entity";
import { CommentLike } from "./post-comment-like.entity";

@Entity("post_comments")
export class PostComment {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: number;

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: "CASCADE" })
  @JoinColumn({ name: "post_id" })
  post!: Post;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: "author_id" })
  author!: Employee;

  @Column({ nullable: true, type: "bigint" })
  authorId!: number;

  @Column({ type: "text" })
  content!: string;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @OneToMany(() => CommentReply, (reply) => reply.comment, { cascade: true, onDelete: "CASCADE" })
  replies!: CommentReply[];

  @OneToMany(() => CommentLike, (like) => like.comment, { cascade: true, onDelete: "CASCADE" })
  likes!: CommentLike[];
}
