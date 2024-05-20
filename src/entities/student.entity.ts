import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from "typeorm";
import { Account } from "./account.entity";
import { Base } from "./base";
import { Class } from "./class.entity";
import { StudentScore } from "./student_score.entity";
import { StudentStatus } from "../common/constants";
import { Grade } from "./grade.entity";
import { Conduct } from "./conduct.entity";

@Entity()
export class Student extends Base {
  @OneToOne(() => Account, { cascade: true, onDelete: "CASCADE" })
  @JoinColumn()
  account: Account;

  @ManyToOne(() => Grade)
  grade: Grade;

  @ManyToMany(() => Class, (_class) => _class.students)
  class_schools: Class[];

  @OneToMany(() => StudentScore, (student_score) => student_score.class_score)
  student_scores: StudentScore[];

  @OneToMany(() => Conduct, (conduct) => conduct.student)
  conducts: Conduct[];

  @Column({ type: "enum", enum: StudentStatus, default: StudentStatus.ACTIVE })
  status: StudentStatus;
}
