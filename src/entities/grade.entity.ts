import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
} from "typeorm";
import { Subject } from "./subject.entity";
import { Class } from "./class.entity";

@Entity()
export class Grade {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: number;

  @ManyToMany(() => Subject, (subject) => subject.grades)
  @JoinTable()
  subjects: Subject[];

  @OneToMany(() => Class, (_class) => _class.grade)
  classes: Class[];
}
