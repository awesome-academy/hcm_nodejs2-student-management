import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Class } from "./class.entity";
import { Subject } from "./subject.entity";

@Entity()
export class Grade {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: number;

  @ManyToMany(() => Subject, (subject) => subject.grades)
  @JoinTable()
  subjects: Subject[];

  @OneToMany(() => Class, (_class: Class) => _class.grade)
  classes: Class[];
}
