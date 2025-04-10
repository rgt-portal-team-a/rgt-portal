import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from "typeorm";
import { Employee } from "./employee.entity";

@Entity("departments")
export class Department {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: number;

  @Column({ unique: true, type: "varchar" })
  name!: string;

  @Column({ nullable: true, type: "text" })
  description!: string;

  @Column({ nullable: true, type: "bigint" })
  managerId!: number;

  @ManyToOne(() => Employee, { onDelete: 'SET NULL' })
  @JoinColumn({ name: "manager_id" })
  manager!: Employee;

  @OneToMany(() => Employee, (employee) => employee.department, { cascade: true })
  employees!: Employee[];
}
