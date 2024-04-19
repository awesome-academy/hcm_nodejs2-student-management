import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { MAX_LENGTH_30, SemesterNames } from "../common/constants";
import { Teaching } from "./teaching.entity";
import { ClassScore } from "./class_score.entity";

@Entity()
export class Semester {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "enum", enum: SemesterNames })
  semester_name: SemesterNames;

  @Column({ length: MAX_LENGTH_30 })
  school_year: string;

  @OneToMany(() => Teaching, (teaching) => teaching.teacher)
  teachings: Teaching[];

  @OneToMany(() => ClassScore, (class_score) => class_score.semester)
  class_scores: ClassScore[];
}
