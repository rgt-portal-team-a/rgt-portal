import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Employee } from "./employee.entity";

@Entity("attendance_records")
export class AttendanceRecord {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: number;

  @Column({ nullable: true, type: "bigint" })
  employeeId!: number;

  @Column({ nullable: true, type: "timestamp" })
  checkIn!: Date;

  @Column({ nullable: true, type: "timestamp" })
  checkOut!: Date;

  @Column({ nullable: true, type: "varchar" })
  status!: string;

  @ManyToOne(() => Employee, (employee) => employee.attendanceRecords)
  @JoinColumn({ name: "employee_id" })
  employee!: Employee;
}
