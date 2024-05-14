import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { MAX_LENGTH_30, SemesterNames } from "../common/constants";

@Entity()
export class Semester {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "enum", enum: SemesterNames })
  name: SemesterNames;

  @Column({ length: MAX_LENGTH_30 })
  school_year: string;
}
