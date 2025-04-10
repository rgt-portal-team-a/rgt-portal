import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Role } from "./role.entity";
import { Employee } from "./employee.entity";

export enum UserStatus {
  AWAITING = "awaiting",
  ACTIVE = "active",
  INACTIVE = "inactive"
}

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

  @Column({ 
    type: "enum", 
    enum: UserStatus, 
    default: UserStatus.AWAITING 
  })
  status!: UserStatus;

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
