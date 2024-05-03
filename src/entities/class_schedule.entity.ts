import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Class } from "./class.entity";
import { PeriodSchedule } from "./period_schedule.entity";
import { Semester } from "./semester.entity";

@Entity()
export class ClassSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Class)
  @JoinColumn({ name: "class_id", referencedColumnName: "id" })
  class: Class;

  @ManyToOne(() => Semester)
  @JoinColumn({ name: "semester_id", referencedColumnName: "id" })
  semester: Semester;

  @OneToMany(
    () => PeriodSchedule,
    (period_schedule) => period_schedule.class_schedule
  )
  period_schedules: PeriodSchedule[];
}
