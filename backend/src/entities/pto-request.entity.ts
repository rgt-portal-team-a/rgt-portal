import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Employee } from "./employee.entity";
import { PtoStatusType } from "@/defaults/enum";

@Entity("pto_requests")
export class PtoRequest {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: number;

  @Column({ type: "timestamp" })
  startDate!: Date;

  @Column({ type: "timestamp" })
  endDate!: Date;

  @Column({default: PtoStatusType.PENDING, type: "enum", enum: PtoStatusType})
  status!: PtoStatusType;

  @Column({ type: "varchar" })
  type!: string;

  @Column({ nullable: true, type: "text" })
  reason!: string;

  @Column({nullable: true, type: "bigint"})
  departmentId!: number;


  @Column({ nullable: true, type: "text" })
  statusReason!: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @ManyToOne(() => Employee, (employee) => employee.ptoRequests)
  @JoinColumn({ name: "employee_id" })
  employee!: Employee;


  @ManyToOne(() => Employee)
  @JoinColumn({ name: "approver_id" })
  approver!: Employee;

}
