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

@Entity()
export class Teacher extends Base {
  @OneToOne(() => Account, {cascade: true, onDelete: "CASCADE"})
  @JoinColumn()
  account: Account;

  @Column({ type: "enum", enum: TeacherStatus, default: TeacherStatus.ACTIVE })
  status: TeacherStatus;

  @ManyToMany(() => Subject)
  @JoinTable()
  subjects: Subject[];

  @OneToMany(() => Class, (_class) => _class.teacher)
  classes: Class[];
}
