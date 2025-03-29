import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";

@Entity("job_match_results")
export class JobMatchResult {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ nullable: true, type: "uuid" })
  candidateId!: string;

  @Column({ nullable: true, type: "varchar" })
  jobTitle!: string;

  @Column({ nullable: true, type: "float" })
  matchPercentage!: number;

  @Column({ nullable: true, type: "boolean", default: true })
  isActive!: boolean;


  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
} 