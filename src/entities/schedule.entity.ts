import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import { Days } from "../common/constants";
import { PeriodSchedule } from "./period_schedule.entity";
import { Subject } from "./subject.entity";
import { Teacher } from "./teacher.entity";
import { Teaching } from "./teaching.entity";
import { Class } from "./class.entity";
import { Semester } from "./semester.entity";

@Entity()
export class Schedule {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => PeriodSchedule,
    (period_schedule) => period_schedule.schedules
  )
  period_schedule: PeriodSchedule;

  @ManyToOne(() => Class)
  class_school: Class;

  @ManyToOne(() => Semester)
  semester: Semester;

  @ManyToOne(() => Teaching)
  teaching: Teaching;

  @ManyToOne(() => Teacher)
  teacher: Teacher;

  @ManyToOne(() => Subject)
  subject: Subject;

  @Column({ type: "enum", enum: Days })
  day: Days;
}
