import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { PeriodSchedule } from "./period_schedule.entity";
import { Teacher } from "./teacher.entity";
import { Subject } from "./subject.entity";
import { Class } from "./class.entity";
import { Semester } from "./semester.entity";
import { Days } from "../common/constants";

@Entity()
export class Schedule {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => PeriodSchedule,
    (period_schedule) => period_schedule.schedules
  )
  period_schedule: PeriodSchedule;

  @ManyToOne(() => Teacher)
  @JoinColumn({ name: "teacher_id", referencedColumnName: "id" })
  teacher: Teacher;

  @ManyToOne(() => Subject)
  @JoinColumn({ name: "subject_id", referencedColumnName: "id" })
  subject: Subject;

  @ManyToOne(() => Class)
  @JoinColumn({ name: "class_id", referencedColumnName: "id" })
  class_school: Class;

  @ManyToOne(() => Semester)
  @JoinColumn({ name: "semester_id", referencedColumnName: "id" })
  semester: Semester;

  @Column({ type: "enum", enum: Days })
  day: Days;
}
