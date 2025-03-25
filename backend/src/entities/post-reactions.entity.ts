import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from "typeorm";
import { Employee } from "./employee.entity";
import { Post } from "./post.entity";

@Entity("post_reactions")
export class PostReaction {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: number;

  @ManyToOne(() => Post, (post) => post.reactions)
  @JoinColumn({ name: "post_id" })
  post!: Post;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: "employee_id" })
  employee!: Employee;

  @Column({ nullable: true, type: "bigint" })
  employeeId!: number;

  @Column({ type: "varchar", length: 10 })
  emoji!: string; // Stores emoji Unicode (e.g., "😂", "🔥", "❤️")

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;
}
