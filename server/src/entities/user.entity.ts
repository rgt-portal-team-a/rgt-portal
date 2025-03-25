import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Role } from "./role.entity";
import { Employee } from "./employee.entity";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: number;

  @Column({ unique: true, type: "varchar" })
  username!: string;

  @Column({ nullable: true, type: "text" })
  password?: string;

  @Column({ default: false, type: "boolean" })
  isPasswordSet?: boolean;

  @Column({ default: false, type: "boolean" })
  requiresVerification?: boolean;

  @Column({ nullable: true, type: "text" })
  profileImage!: string;

  @Column({ unique: true, type: "varchar" })
  email!: string;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: "role_id" })
  role!: Role;

  @OneToOne(() => Employee, (employee) => employee.user)
  employee!: Employee;
}
