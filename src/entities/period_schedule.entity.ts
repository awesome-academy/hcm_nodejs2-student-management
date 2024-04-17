import { Periods } from "../common/constants";
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ClassSchedule } from "./class_schedule.entity";
import { Schedule } from "./schedule.entity";

@Entity()
export class PeriodSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "enum", enum: Periods })
  period: Periods;

  @ManyToOne(
    () => ClassSchedule,
    (class_schedule) => class_schedule.period_schedules
  )
  class_schedule: ClassSchedule;

  @OneToMany(() => Schedule, (schedule) => schedule.period_schedule)
  schedules: Schedule[];
}
