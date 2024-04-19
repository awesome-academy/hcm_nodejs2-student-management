import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { ScoreType } from "./score_type.entity";
import { StudentScore } from "./student_score.entity";

@Entity()
export class Score {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "decimal", precision: 2, scale: 2 })
  score: number;

  @ManyToOne(() => ScoreType)
  @JoinColumn([{ name: "score_type_id", referencedColumnName: "id" }])
  scoreType: ScoreType;

  @ManyToOne(() => StudentScore, (student_score) => student_score.scores)
  student_score: StudentScore;
}