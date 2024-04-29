import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
} from "typeorm";
import { TeacherStatus } from "../common/constants";
import { Account } from "./account.entity";
import { Base } from "./base";
import { Class } from "./class.entity";
import { Subject } from "./subject.entity";
import { Teaching } from "./teaching.entity";

@Entity()
export class Teacher extends Base {
  @OneToOne(() => Account)
  @JoinColumn()
  account: Account;

  @Column({ type: "enum", enum: TeacherStatus, default: TeacherStatus.ACTIVE })
  status: TeacherStatus;

  @ManyToMany(() => Subject, (subject) => subject.teachers)
  @JoinTable()
  subjects: Subject[];

  @OneToOne(() => Class, (_class) => _class.teacher)
  @JoinColumn()
  class_school: Class;

  @OneToMany(() => Teaching, (teaching) => teaching.teacher)
  teachings: Teaching[];
}
