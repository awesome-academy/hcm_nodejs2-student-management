import { Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Class } from "./class.entity";
import { Semester } from "./semester.entity";
import { StudentScore } from "./student_score.entity";
import { Subject } from "./subject.entity";

@Entity()
export class ClassScore {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Class, (_class) => _class.class_scores)
  class_school: Class;

  @ManyToOne(() => Subject, (subject) => subject.class_scores)
  subject: Subject;

  @ManyToOne(() => Semester, (semester) => semester.class_scores)
  semester: Semester;

  @OneToMany(() => StudentScore, (student_score) => student_score.class_score)
  student_scores: StudentScore[];
}
