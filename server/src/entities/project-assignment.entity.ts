import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Project } from "./project.entity";
import { Employee } from "./employee.entity";

@Entity("project_assignments")
export class ProjectAssignment {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: number;

  @Column({ nullable: true, type: "bigint" })
  projectId!: number;

  @Column({ nullable: true, type: "bigint" })
  employeeId!: number;

  @Column({ type: "timestamp" })
  assignedDate!: Date;

  @Column({ type: "varchar" })
  role!: string;

  @ManyToOne(() => Project, (project) => project.assignments)
  @JoinColumn({ name: "project_id" })
  project!: Project;

  @ManyToOne(() => Employee, (employee) => employee.projectAssignments)
  @JoinColumn({ name: "employee_id" })
  employee!: Employee;
}
