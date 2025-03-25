import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { Employee } from "./employee.entity";
import { Project } from "./project.entity";

@Entity("employeerecognitions")
export class EmployeeRecognition {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: number;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: "recognized_by_id" })
  recognizedBy!: Employee;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: "recognized_employee_id" })
  recognizedEmployee!: Employee;

  @Column({ type: "varchar" })
  project!: string;

  @Column({ nullable: true, type: "varchar" })
  category?: string; //(e.g., "Leadership", "Teamwork", ......)

  @Column({ type: "text" })
  message!: string;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;
}
