import {
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import { Class } from "./class.entity";
import { PeriodSchedule } from "./period_schedule.entity";
import { Semester } from "./semester.entity";

@Entity()
export class ClassSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Class, {cascade: true, onDelete: "CASCADE"})
  class_school: Class;

  @ManyToOne(() => Semester)
  semester: Semester;

  @OneToMany(
    () => PeriodSchedule,
    (period_schedule) => period_schedule.class_schedule
  )
  period_schedules: PeriodSchedule[];
}
