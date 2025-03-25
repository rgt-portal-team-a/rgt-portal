import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany } from "typeorm";
import { User } from "./user.entity";
import { Employee } from "./employee.entity";
import { EmergencyContact } from "./emergency-contact.entity";
import { FailStage, RecruitmentStatus, RecruitmentType } from "@/defaults/enum";

@Entity("recruitments")
export class Recruitment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar" })
  name!: string;

  @Column({ nullable: true, type: "text" })
  photoUrl?: string;

  @Column({ type: "date", nullable: true })
  date!: Date;

  @Column({ nullable: true, type: "varchar" })
  email!: string;

  @Column({ nullable: true, type: "varchar" })
  phoneNumber!: string;

  @Column({ nullable: true, type: "varchar" })
  cvPath!: string;

  @Column({ nullable: true, type: "varchar" })
  programOfStudy?: string;

  @Column({
    type: "enum",
    enum: RecruitmentType,
    default: RecruitmentType.EMPLOYEE,
  })
  type!: RecruitmentType;

  @Column({
    type: "enum",
    enum: RecruitmentStatus,
    default: RecruitmentStatus.CV_REVIEW,
  })
  currentStatus!: RecruitmentStatus;

  @Column({ type: "date", nullable: true })
  statusDueDate!: Date;

  @Column({ nullable: true, type: "varchar" })
  assignee!: string;

  @Column({ nullable: true, type: "boolean" })
  notified!: boolean;

  @Column({ nullable: true, type: "varchar" })
  location!: string;

  @Column({ nullable: true, type: "varchar" })
  firstPriority!: string;

  @Column({ nullable: true, type: "varchar" })
  secondPriority!: string;

  @Column({ nullable: true, type: "varchar" })
  university!: string;

  @Column({ nullable: true, type: "varchar" })
  position!: string;

  @Column({ nullable: true, type: "varchar" })
  source!: string;

  @Column({ nullable: true, type: "varchar" })
  currentTitle?: string;

  @Column({ nullable: true, type: "varchar" })
  highestDegree?: string;

  @Column({ nullable: true, type: "varchar" })
  graduationYear?: string;

  @Column({ type: "text", array: true, nullable: true })
  technicalSkills?: string[];

  @Column({ nullable: true, type: "text", array: true })
  programmingLanguages?: string[];

  @Column({ nullable: true, type: "text", array: true })
  toolsAndTechnologies?: string[];

  @Column({ nullable: true, type: "text", array: true })
  softSkills?: string[];

  @Column({ nullable: true, type: "text", array: true })
  industries?: string[];

  @Column({ nullable: true, type: "text", array: true })
  certifications?: string[];

  @Column({ nullable: true, type: "text", array: true })
  keyProjects?: string[];

  @Column({ nullable: true, type: "text", array: true })
  recentAchievements?: string[];

  @Column({
    type: "enum",
    enum: FailStage,
    nullable: true,
  })
  failStage!: FailStage;

  @Column({ type: "text", nullable: true })
  failReason?: string;

  @Column({ type: "text", nullable: true })
  notes!: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "created_by" })
  createdBy!: User;

  @OneToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: "employee_id" })
  employee?: Employee;

  @OneToMany(() => EmergencyContact, (emergencyContact) => emergencyContact.recruitment)
  emergencyContacts!: EmergencyContact[];

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
}
