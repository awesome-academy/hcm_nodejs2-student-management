import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Semester } from "./semester.entity";
import { Subject } from "./subject.entity";
import { Teacher } from "./teacher.entity";
import { Class } from "./class.entity";

@Entity()
export class Teaching {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Teacher)
  teacher: Teacher;

  @ManyToOne(() => Subject)
  subject: Subject;

  @ManyToOne(() => Class)
  class_school: Class;

  @ManyToOne(() => Semester)
  semester: Semester;
}
