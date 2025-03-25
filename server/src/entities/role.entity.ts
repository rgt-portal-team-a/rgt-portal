import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { User } from "./user.entity";

@Entity("roles")
export class Role {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: number;

  @Column({ unique: true, type: "varchar" })
  name!: string;

  @Column({ nullable: true, type: "text" })
  description!: string;

  @OneToMany(() => User, (user) => user.role)
  users!: User[];
}
