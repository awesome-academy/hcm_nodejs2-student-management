import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ConductTypes } from "../common/constants";
import { Semester } from "./semester.entity";
import { Student } from "./student.entity";

@Entity()
export class Conduct {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "enum", enum: ConductTypes, default: ConductTypes.EXCELLENT })
  type: ConductTypes;

  @ManyToOne(() => Student, (student) => student.conducts)
  student: Student;

  @ManyToOne(() => Semester)
  semester: Semester;
}
