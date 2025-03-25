import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Poll } from "./poll.entity";
import { PollVote } from "./poll-vote.entity";

@Entity("poll_options")
export class PollOption {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: number;

  @Column({ nullable: true, type: "bigint" })
  pollId!: number;

  @ManyToOne(() => Poll, (poll) => poll.options, { onDelete: "CASCADE" })
  @JoinColumn({ name: "poll_id" })
  poll!: Poll;

  @Column({ type: "text", nullable: true })
  text!: string;

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, any>;

  @OneToMany(() => PollVote, (vote) => vote.option)
  votes!: PollVote[];

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;

  // Virtual property
  voteCount?: number;
}
