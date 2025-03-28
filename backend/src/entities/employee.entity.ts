import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn, OneToMany } from "typeorm";
import { User } from "./user.entity";
import { Department } from "./department.entity";
import { PtoRequest } from "./pto-request.entity";
import { ProjectAssignment } from "./project-assignment.entity";
import { Post } from "./post.entity";
import { EventParticipant } from "./event-participant.entity";
import { AttendanceRecord } from "./attendance-record.entity";
import { EmployeeRecognition } from "./employee-recognition.entity";
import { Poll } from "./poll.entity";
import { PollVote } from "./poll-vote.entity";
import { Event } from "./event.entity";


export enum EmployeeType {
  FULL_TIME = "full_time",
  PART_TIME = "part_time",
  CONTRACTOR = "contractor",
  NSP = "nsp",
}

export enum WorkType {
  HYBRID = "hybrid",
  REMOTE = "remote",
}

export enum LeaveType {
  QUIT = "quit",
  LAYOFF = "layoff",
  DISMISSED = "dismissed",
  OTHER = "other",
}

export interface Agency {
  name: string;
  paid: boolean;
  invoiceReceived: boolean;
  invoiceAmount?: number;
  invoiceNumber?: string;
  invoiceDate?: Date;
  invoiceDueDate?: Date;
}

@Entity("employees")
export class Employee {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: number;

  @Column({ nullable: true, type: "varchar" })
  firstName!: string;

  @Column({ nullable: true, type: "varchar" })
  lastName!: string;

  @Column({ nullable: true, type: "varchar" })
  phone!: string;

  @Column({ nullable: true, type: "date" })
  birthDate?: Date;

  @Column({ type: "text", array: true, nullable: true })
  skills?: string[];

  @Column({ nullable: true, type: "enum", enum: EmployeeType })
  employeeType?: EmployeeType;

  @Column({ nullable: true, default: WorkType.HYBRID, type: "enum", enum: WorkType })
  workType?: WorkType;

  @Column({ nullable: true, type: "varchar" })
  position!: string;

  @Column({ type: "jsonb", nullable: true })
  agency?: Agency;

  @Column({ nullable: true, type: "timestamp" })
  hireDate!: Date;

  @Column({ nullable: true, type: "timestamp" })
  endDate?: Date;

  @Column({ default: 15, type: "int" })
  sickDaysBalance!: number;

  @Column({ default: 30, type: "int" })
  annualDaysOff!: number;

  @Column({ default: 15, type: "int" })
  vacationDaysBalance!: number;

  @Column({ nullable: true, type: "enum", enum: LeaveType })
  leaveType?: LeaveType;

  @Column({ nullable: true, type: "text" })
  leaveExplanation?: string;

  @Column({ type: "boolean", default: false })
  activePtoRequest!: boolean;

  @Column({ type: "boolean", default: false })
  isSeniorTeamLead!: boolean;

  @Column({ type: "boolean", default: false })
  isJuniorTeamLead!: boolean;

  @Column({ nullable: true, type: "text" })
  notes?: string;

  @Column({ type: "jsonb", default: {} })
  contactDetails!: Record<string, any>;

  @OneToMany(() => EmployeeRecognition, (recognition) => recognition.recognizedBy)
  givenRecognitions!: EmployeeRecognition[];

  @OneToMany(() => EmployeeRecognition, (recognition) => recognition.recognizedEmployee)
  receivedRecognitions!: EmployeeRecognition[];

  @OneToOne(() => User, (user) => user.employee)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToOne(() => Department)
  @JoinColumn({ name: "department_id" })
  department!: Department | null;

  @Column({ nullable: true, type: "int" })
  departmentId!: number | null;

  @OneToMany(() => PtoRequest, (ptoRequest) => ptoRequest.employee)
  ptoRequests!: PtoRequest[];

  @OneToMany(() => ProjectAssignment, (projectAssignment) => projectAssignment.employee)
  projectAssignments!: ProjectAssignment[];

  @OneToMany(() => Post, (post) => post.author)
  posts!: Post[];

  @OneToMany("Event", "organizer")
  organizedEvents!: Event[];

  @OneToMany(() => EventParticipant, (eventParticipant) => eventParticipant.employee)
  eventParticipations!: EventParticipant[];

  @OneToMany(() => AttendanceRecord, (attendanceRecord) => attendanceRecord.employee)
  attendanceRecords!: AttendanceRecord[];

  @OneToMany(() => Poll, (poll) => poll.createdBy)
  createdPolls!: Poll[];

  @OneToMany(() => PollVote, (vote) => vote.employee)
  pollVotes!: PollVote[];
}
