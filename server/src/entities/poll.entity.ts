import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";
import { Employee } from "./employee.entity";
import { PollOption } from "./poll-option.entity";
import { PollVote } from "./poll-vote.entity";

export enum PollStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  CLOSED = "closed",
}

export enum PollType {
  SINGLE_CHOICE = "single_choice",
  MULTIPLE_CHOICE = "multiple_choice",
}

@Entity("polls")
export class Poll {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: number;

  @Column({ type: "text" })
  description!: string;

  @Column({
    type: "enum",
    enum: PollStatus,
    default: PollStatus.DRAFT,
  })
  status!: PollStatus;

  @Column({
    type: "enum",
    enum: PollType,
    default: PollType.SINGLE_CHOICE,
  })
  type!: PollType;

  @Column({ nullable: true, type: "bigint" })
  @Index()
  createdById!: number;

  @ManyToOne(() => Employee, (employee) => employee.createdPolls)
  @JoinColumn({ name: "created_by_id" })
  createdBy!: Employee;

  @Column({ type: "timestamp", nullable: true })
  @Index()
  startDate?: Date;

  @Column({ type: "timestamp", nullable: true })
  @Index()
  endDate?: Date;

  @Column({ default: false, type: "boolean" })
  isAnonymous!: boolean;

  @Column({ default: true, type: "boolean" })
  allowComments!: boolean;

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, any>;

  @OneToMany(() => PollOption, (option) => option.poll, { cascade: true })
  options!: PollOption[];

  @OneToMany(() => PollVote, (vote) => vote.poll)
  votes!: PollVote[];

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;

  voteCount?: number;
  participationRate?: number;
}
