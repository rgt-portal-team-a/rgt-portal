import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Recruitment } from "./recruitment.entity";
import { RelationshipType } from "@/defaults/enum";

@Entity("emergency_contacts")
export class EmergencyContact {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: number;

  @Column({ type: "varchar" })
  firstName!: string;

  @Column({ type: "varchar" })
  lastName!: string;

  @Column({ type: "varchar" })
  phoneNumber!: string;

  @Column({
    type: "enum",
    enum: RelationshipType,
  })
  relationship!: RelationshipType;

  @Column({ default: false, type: "boolean" })
  isPrimary!: boolean;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;

  @ManyToOne(() => Recruitment, (recruitment) => recruitment.emergencyContacts)
  @JoinColumn({ name: "recruitment_id" })
  recruitment!: Recruitment;
}
