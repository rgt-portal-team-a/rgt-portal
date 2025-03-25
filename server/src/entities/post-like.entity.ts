import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from "typeorm";
import { Employee } from "./employee.entity";
import { Post } from "./post.entity";

@Entity("post_likes")
export class PostLike {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: number;

  @ManyToOne(() => Post, (post) => post.likes)
  @JoinColumn({ name: "post_id" })
  post!: Post;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: "employee_id" })
  employee!: Employee;

  @Column({ nullable: true, type: "bigint" })
  employeeId!: number;

  @Column({ type: "boolean" })
  isLike!: boolean; 
}
