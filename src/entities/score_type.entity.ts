import { MAX_LENGTH_30, ScoreFactors } from "../common/constants";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ScoreType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: MAX_LENGTH_30 })
  name: string;

  @Column({ type: "enum", enum: ScoreFactors })
  factor: ScoreFactors;
}
