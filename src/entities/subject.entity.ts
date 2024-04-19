import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  OneToMany,
} from "typeorm";
import { MAX_LENGTH_30 } from "../common/constants";
import { Grade } from "./grade.entity";
import { Teacher } from "./teacher.entity";
import { Teaching } from "./teaching.entity";
import { ClassScore } from "./class_score.entity";

@Entity()
export class Subject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: MAX_LENGTH_30 })
  name: string;

  @ManyToMany(() => Grade, (grade) => grade.subjects)
  grades: Grade[];

  @ManyToMany(() => Teacher, (teacher) => teacher.subjects)
  teachers: Teacher[];

  @OneToMany(() => Teaching, (teaching) => teaching.teacher)
  teachings: Teaching[];

  @OneToMany(() => ClassScore, (class_score) => class_score.subject)
  class_scores: ClassScore[];
}
