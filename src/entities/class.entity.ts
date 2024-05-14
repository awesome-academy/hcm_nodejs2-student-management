import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import { ClassStatus, MAX_LENGTH_30 } from "../common/constants";
import { Grade } from "./grade.entity";
import { Student } from "./student.entity";
import { Teacher } from "./teacher.entity";

@Entity()
export class Class {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: MAX_LENGTH_30 })
  name: string;

  @Column({ length: MAX_LENGTH_30 })
  school_year: string;

  @Column({ type: "enum", enum: ClassStatus, default: ClassStatus.ACTIVE })
  status: ClassStatus;

  @ManyToOne(() => Teacher, (teacher) => teacher.classes)
  teacher: Teacher;

  @ManyToMany(() => Student, (student) => student.class_schools)
  @JoinTable()
  students: Student[];

  @ManyToOne(() => Grade, (grade) => grade.classes)
  grade: Grade;
}
