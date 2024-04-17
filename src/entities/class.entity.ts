import { ClassStatus, MAX_LENGTH_30 } from "../common/constants";
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ClassScore } from "./class_score.entity";
import { Grade } from "./grade.entity";
import { Student } from "./student.entity";
import { Teacher } from "./teacher.entity";
import { Teaching } from "./teaching.entity";

@Entity()
export class Class {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: MAX_LENGTH_30 })
  name: string;

  @Column({ type: "enum", enum: ClassStatus, default: ClassStatus.ACTIVE })
  status: ClassStatus;

  @OneToOne(() => Teacher, (teacher) => teacher.class_school)
  teacher: Teacher;

  @OneToMany(() => Student, (student) => student.class_school)
  students: Student[];

  @ManyToOne(() => Grade, (grade) => grade.classes)
  @JoinColumn()
  grade: Grade;

  @OneToMany(() => Teaching, (teaching) => teaching.teacher)
  teachings: Teaching[];

  @OneToMany(() => ClassScore, (class_score) => class_score.class_school)
  class_scores: ClassScore[];
}
