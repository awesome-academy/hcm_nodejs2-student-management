import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import { StudentScore } from "./student_score.entity";
import { ScoreFactors } from "../common/constants";

@Entity()
export class Score {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "decimal", precision: 4, scale: 2 })
  score: number;

  @Column({ type: "enum", enum: ScoreFactors })
  factor: ScoreFactors;

  @ManyToOne(() => StudentScore, (student_score) => student_score.scores)
  student_score: StudentScore;
}
