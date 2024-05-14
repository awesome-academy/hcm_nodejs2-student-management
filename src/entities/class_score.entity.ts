import { Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Class } from "./class.entity";
import { Semester } from "./semester.entity";
import { StudentScore } from "./student_score.entity";
import { Subject } from "./subject.entity";

@Entity()
export class ClassScore {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Class)
  class_school: Class;

  @ManyToOne(() => Subject)
  subject: Subject;

  @ManyToOne(() => Semester)
  semester: Semester;

  @OneToMany(() => StudentScore, (student_score) => student_score.class_score)
  student_scores: StudentScore[];
}
