import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { Employee } from "./employee.entity";
import { ProjectAssignment } from "./project-assignment.entity";

@Entity("projects")
export class Project {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: number;

  @Column({ nullable: true, type: "bigint" })
  leadId!: number;

  @Column({ type: "varchar" })
  name!: string;

  @Column({ nullable: true, type: "text" })
  description!: string;

  @Column({ type: "timestamp" })
  startDate!: Date;

  @Column({ type: "timestamp" })
  endDate!: Date;

  @Column({ type: "varchar" })
  status!: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: "lead_id" })
  lead!: Employee;

  @OneToMany(() => ProjectAssignment, (projectAssignment) => projectAssignment.project)
  assignments!: ProjectAssignment[];
}
