import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { Employee } from "./employee.entity";
import { EventParticipant } from "./event-participant.entity";
import { EventType } from "@/defaults/enum";

@Entity("events")
export class Event {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: number;

  @Column({ type: "varchar" })
  title!: string;

  @Column({ type: "text" })
  description?: string;

  @Column({ type: "timestamp" })
  startTime!: Date;

  @Column({ type: "timestamp" })
  endTime!: Date;

  @Column({ type: "enum", enum: EventType, default: EventType.OTHER })
  type!: EventType;

  @Column({nullable: true, type: "text" })
  location?: string;

  @Column({nullable: true, type: "bigint" })
  organizerId!: number;

  @ManyToOne("Employee", "organizedEvents")
  @JoinColumn({ name: "organizer_id" })
  organizer!: Employee;

  @OneToMany(() => EventParticipant, (eventParticipant) => eventParticipant.event)
  participants?: EventParticipant[];
}
