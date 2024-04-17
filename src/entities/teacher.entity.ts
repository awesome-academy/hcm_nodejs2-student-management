import {
  Entity,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from "typeorm";
import { Base } from "./base";
import { Account } from "./account.entity";
import { Subject } from "./subject.entity";
import { Class } from "./class.entity";
import { Teaching } from "./teaching.entity";

@Entity()
export class Teacher extends Base {
  @OneToOne(() => Account)
  @JoinColumn()
  account: Account;

  @ManyToMany(() => Subject, (subject) => subject.teachers)
  @JoinTable()
  subjects: Subject[];

  @OneToOne(() => Class, (_class) => _class.teacher)
  @JoinColumn()
  class_school: Class;

  @OneToMany(() => Teaching, (teaching) => teaching.teacher)
  teachings: Teaching[];
}
