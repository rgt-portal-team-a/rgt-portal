import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from "typeorm";
import { Employee } from "./employee.entity";
import { PostLike } from "./post-like.entity";
import { PostReaction } from "./post-reactions.entity";
import { PostComment } from "./post-comment.entity";

@Entity("posts")
export class Post {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: number;

  @Column({ type: "text" })
  content!: string;

  @Column({ type: "text", array: true, nullable: true })
  media?: string[];

  @Column({ nullable: true, type: "bigint" })
  authorId!: number;

  @CreateDateColumn({ type: "timestamp" })
  publishDate!: Date;

  @Column({ default: true, type: "boolean" })
  isActive!: boolean;

  @ManyToOne(() => Employee, (employee) => employee.posts)
  @JoinColumn({ name: "author_id" })
  author!: Employee;

  @OneToMany(() => PostLike, (like) => like.post)
  likes!: PostLike[];

  @OneToMany(() => PostReaction, (reaction) => reaction.post)
  reactions!: PostReaction[];

  @OneToMany(() => PostComment, (comment) => comment.post)
  comments!: PostComment[];
}
