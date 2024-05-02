import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Column,
} from "typeorm";
import {
  MAX_LENGTH_30,
  MAX_LENGTH_50,
  MAX_LENGTH_100,
  Genders,
} from "../common/constants";

export abstract class Base {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: MAX_LENGTH_50 })
  name: string;

  @Column({ length: MAX_LENGTH_100 })
  address: string;

  @Column({ length: MAX_LENGTH_50 })
  email: string;

  @Column({ length: MAX_LENGTH_30 })
  phone: string;

  @Column({ type: "enum", enum: Genders })
  gender: Genders;

  @Column({ type: "date" })
  date_of_birth: Date;

  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  created_at: Date;

  @UpdateDateColumn({
    default: () => "CURRENT_TIMESTAMP(6)",
    onUpdate: "CURRENT_TIMESTAMP(6)",
  })
  updated_at: Date;
}
