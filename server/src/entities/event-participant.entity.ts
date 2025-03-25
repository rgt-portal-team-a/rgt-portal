import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Event } from "./event.entity";
import { Employee } from "./employee.entity";

@Entity("event_participants")
export class EventParticipant {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: number;

  @Column({ nullable: true, type: "bigint" })
  eventId!: number;

  @Column({ nullable: true, type: "bigint" })
  employeeId!: number;

  @Column({ type: "varchar" })
  status!: string;

  @ManyToOne(() => Event, (event) => event.participants)
  @JoinColumn({ name: "event_id" })
  event!: Event;

  @ManyToOne(() => Employee, (employee) => employee.eventParticipations)
  @JoinColumn({ name: "employee_id" })
  employee!: Employee;
}
