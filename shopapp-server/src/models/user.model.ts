import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { UserRole } from "../utils/constant";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  name?: string;

  @Column({ unique: true })
  email!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  password?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  avatar?: string;

  @Column({ type: "varchar", nullable: true })
  googleId?: string;

  @Column({ type: "varchar", length: 15, nullable: true })
  phoneNumber?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  refreshToken?: string;

  @Column({ type: "varchar", nullable: true })
  otpCode?: string | null;

  @Column({ type: "varchar", nullable: true })
  otpExpiresAt?: Date | null;

  @Column({ default: false })
  isVerified!: boolean;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.USER,
  })
  role!: UserRole;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
