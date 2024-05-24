import { Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ClassScore } from "./class_score.entity";
import { Score } from "./score.entity";
import { Semester } from "./semester.entity";
import { Student } from "./student.entity";

@Entity()
export class StudentScore {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ClassScore, (class_score) => class_score.student_scores, {
    cascade: true,
    onDelete: "CASCADE",
  })
  class_score: ClassScore;

  @ManyToOne(() => Student, (student) => student.student_scores)
  student: Student;

  @ManyToOne(() => Semester)
  semester: Semester;

  @OneToMany(() => Score, (score) => score.student_score)
  scores: Score[];
}
