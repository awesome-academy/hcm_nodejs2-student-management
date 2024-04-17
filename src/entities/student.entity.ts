import { Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { Account } from "./account.entity";
import { Base } from "./base";
import { Class } from "./class.entity";
import { StudentScore } from "./student_score.entity";

@Entity()
export class Student extends Base {
  @OneToOne(() => Account)
  @JoinColumn()
  account: Account;

  @ManyToOne(() => Class, (_class) => _class.students)
  class_school: Class;

  @OneToMany(() => StudentScore, (student_score) => student_score.class_score)
  student_scores: StudentScore[];
}
