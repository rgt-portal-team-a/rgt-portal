import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Unique, Index } from "typeorm";
import { Poll } from "./poll.entity";
import { PollOption } from "./poll-option.entity";
import { Employee } from "./employee.entity";

@Entity("poll_votes")
@Unique(["pollId", "optionId", "employeeId"])
export class PollVote {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: number;

  @Column({ nullable: true, type: "bigint" })
  @Index()
  pollId!: number;

  @ManyToOne(() => Poll, (poll) => poll.votes, { onDelete: "CASCADE" })
  @JoinColumn({ name: "poll_id" })
  poll!: Poll;

  @Column({ nullable: true, type: "bigint" })
  @Index()
  optionId!: number;

  @ManyToOne(() => PollOption, (option) => option.votes, { onDelete: "CASCADE" })
  @JoinColumn({ name: "option_id" })
  option!: PollOption;

  @Column({ nullable: true, type: "bigint" })
  @Index()
  employeeId!: number;

  @ManyToOne(() => Employee, (employee) => employee.pollVotes)
  @JoinColumn({ name: "employee_id" })
  employee!: Employee;

  @Column({ type: "text", nullable: true })
  comment?: string;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;
}
