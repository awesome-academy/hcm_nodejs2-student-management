import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Class } from "./class.entity";
import { Semester } from "./semester.entity";
import { Subject } from "./subject.entity";
import { Teacher } from "./teacher.entity";

@Entity()
export class Teaching {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Teacher, (teacher) => teacher.teachings)
  teacher: Teacher;

  @ManyToOne(() => Subject, (subject) => subject.teachings)
  subject: Subject;

  @ManyToOne(() => Class, (_class) => _class.teachings)
  class_school: Class;

  @ManyToOne(() => Semester, (semester) => semester.teachings)
  semester: Semester;
}
