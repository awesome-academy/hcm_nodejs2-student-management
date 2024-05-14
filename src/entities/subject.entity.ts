import {
  Column,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import { MAX_LENGTH_30 } from "../common/constants";
import { Grade } from "./grade.entity";

@Entity()
export class Subject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: MAX_LENGTH_30 })
  name: string;

  @ManyToMany(() => Grade, (grade) => grade.subjects)
  grades: Grade[];
}
